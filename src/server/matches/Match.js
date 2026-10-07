import { EventEmitter } from "node:events";

import { Game } from "../../domain/Game.js";
import { PLAYERS_PER_GAME, RESULT_TYPES } from "../../domain/constants.js";
import { MESSAGE_TYPES } from "../../application/messages/constants.js";

import
{
    MATCH_TERMINAL_DELAY,
    STATUS,
    STATUS_REASON
}
from "./constants.js";

import { createMessage } from "../messages/message.js";


export class Match extends EventEmitter
{
    constructor(id, server)
    {
        super();

        this.id = id;
        this._server = server;

        // Persistent user ID → Game slot.
        this._players = new Map();

        this._game = null;
        this._nextSlotId = 0;
        this._finished = false;
        this._destroyed = false;
    }

    hasPlayer(userId)
    {
        return this._players.has(userId);
    }

    isPlaying()
    {
        return this._game !== null &&
               !this._finished &&
               !this._destroyed;
    }

    addPlayer(connection)
    {
        if (this._finished || this._destroyed)
        {
            return;
        }

        const userId = connection.userId;

        if (this._players.has(userId) ||
            this._players.size === PLAYERS_PER_GAME)
        {
            return;
        }

        const slotId = this._nextSlotId++;

        this._players.set(userId, slotId);

        connection.join(this.id);

        if (this._players.size === PLAYERS_PER_GAME)
        {
            this._game = new Game();

            this.emit("started");
        }
    }

    makeMove(userId, boardIndex)
    {
        if (!this.isPlaying())
        {
            return;
        }

        const slotId = this._players.get(userId);

        if (!this._game.isTurn(slotId))
        {
            return;
        }

        const result = this._game.move(boardIndex);

        this._handleMoveResult(result);
    }

    forfeit(userId)
    {
        if (!this.isPlaying())
        {
            return;
        }

        if (!this._players.has(userId))
        {
            return;
        }

        const opponentId = this._getOpponentId(userId);

        this.end();

        this._sendResult(
            userId,
            STATUS.DEFEAT,
            STATUS_REASON.FORFEITED
        );

        this._sendResult(
            opponentId,
            STATUS.VICTORY,
            STATUS_REASON.OPPONENT_FORFEITED
        );

        this.destroy();
    }

    // Removes a participant without changing the game result.
    leave(userId)
    {
        const connection = this._server.getUserConnection(userId);

        if (connection)
        {
            connection.leave(this.id);
        }

        const user = this._server.getUser(userId);

        if (user && user.matchId === this.id)
        {
            user.setMatchId(null);
        }

        this._players.delete(userId);
    }

    // Ends gameplay but keeps the Match until cleanup.
    end()
    {
        if (this._finished || this._destroyed)
        {
            return;
        }

        this._finished = true;

        this.emit("finished");
    }

    destroy()
    {
        if (this._destroyed)
        {
            return;
        }

        const playerIds = [...this._players.keys()];

        for (const userId of playerIds)
        {
            this.leave(userId);
        }

        this._game = null;
        this._destroyed = true;

        this.emit("destroyed");
    }

    _handleMoveResult(result)
    {
        switch (result.type)
        {
            case RESULT_TYPES.MOVE:
            case RESULT_TYPES.WIN:
            case RESULT_TYPES.DRAW:
                this._sendMove(result);
                break;

            case RESULT_TYPES.OCCUPIED:
                this._sendOccupied(result);
                break;
        }

        if (result.type === RESULT_TYPES.WIN)
        {
            this._finishWin(result.mark);
            return;
        }

        if (result.type === RESULT_TYPES.DRAW)
        {
            this._finishDraw();
        }
    }

    _sendMove(result)
    {
        const payload =
        {
            index: result.index,
            mark: result.mark,
            nextTurn: result.nextTurn
        };

        this._server.broadcast(
            this.id,
            createMessage(MESSAGE_TYPES.MOVE, payload)
        );
    }

    _sendOccupied(result)
    {
        const payload =
        {
            index: result.index,
            mark: result.mark,
            nextTurn: result.nextTurn
        };

        this._server.broadcast(
            this.id,
            createMessage(MESSAGE_TYPES.OCCUPIED, payload)
        );
    }

    _finishWin(winningMark)
    {
        const winnerId = this._getUserIdBySlot(winningMark);
        const loserId = this._getOpponentId(winnerId);

        this.end();

        setTimeout(() =>
        {
            this._sendResult(
                winnerId,
                STATUS.VICTORY,
                STATUS_REASON.WON
            );

            this._sendResult(
                loserId,
                STATUS.DEFEAT,
                STATUS_REASON.LOST
            );

            this.destroy();
        },
        MATCH_TERMINAL_DELAY);
    }

    _finishDraw()
    {
        this.end();

        setTimeout(() =>
        {
            for (const userId of this._players.keys())
            {
                this._sendResult(
                    userId,
                    STATUS.DRAW,
                    STATUS_REASON.DRAW
                );
            }

            this.destroy();
        },
        MATCH_TERMINAL_DELAY);
    }

    _sendResult(userId, status, reason)
    {
        let messageType;

        switch (status)
        {
            case STATUS.VICTORY:
                messageType = MESSAGE_TYPES.VICTORY;
                break;

            case STATUS.DEFEAT:
                messageType = MESSAGE_TYPES.DEFEAT;
                break;

            case STATUS.DRAW:
                messageType = MESSAGE_TYPES.DRAW;
                break;
        }

        const payload =
        {
            status,
            reason
        };

        this._server.send(
            userId,
            createMessage(messageType, payload)
        );
    }

    _getOpponentId(userId)
    {
        for (const playerId of this._players.keys())
        {
            if (playerId !== userId)
            {
                return playerId;
            }
        }
    }

    _getUserIdBySlot(slotId)
    {
        for (const [userId, playerSlotId] of this._players)
        {
            if (playerSlotId === slotId)
            {
                return userId;
            }
        }
    }
}
