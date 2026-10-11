import { EventEmitter } from "node:events";

import { Game } from "../../domain/Game.js";
import { PLAYERS_PER_GAME, PLAYER_SLOTS, RESULT_TYPES } from "../../domain/constants.js";
import { MESSAGE_TYPES } from "../../application/messages/constants.js";
import { createMessage } from "../messages/message.js";
import { MATCH_STATUS, STATUS, STATUS_REASON } from "./constants.js";


export class Match extends EventEmitter
{
    constructor(id, server)
    {
        super();

        this.id = id;
        this._server = server;

        this._status = MATCH_STATUS.WAITING;
        this._playerSlots = new Map();
        this._availableSlotIds = [...PLAYER_SLOTS];

        this._game = null;
    }

    getStatus()
    {
        return this._status;
    }

    isWaiting()
    {
        return this._status === MATCH_STATUS.WAITING;
    }

    isPlaying()
    {
        return this._status === MATCH_STATUS.PLAYING;
    }

    isDestroyed()
    {
        return this._status === MATCH_STATUS.DESTROYED;
    }

    addPlayer(connection)
    {
        if (!this.isWaiting())
        {
            return;
        }

        const userId = connection.userId;

        if (this._playerSlots.has(userId))
        {
            return;
        }

        const slotId = this._availableSlotIds.pop();

        this._playerSlots.set(userId, slotId);

        connection.join(this.id);

        if (this._playerSlots.size === PLAYERS_PER_GAME)
        {
            this._game = new Game();
            this._status = MATCH_STATUS.PLAYING;

            this.emit("started", [...this._playerSlots.keys()]);
        }
        else
        {
            this.emit("playerAdded", userId);
        }
    }

    makeMove(userId, boardIndex)
    {
        if (!this.isPlaying() || !this._playerSlots.has(userId))
        {
            return;
        }

        const slotId = this._playerSlots.get(userId);
        const result = this._game.move(slotId, boardIndex);

        if (result === null) return;

        this._handleMoveResult(result, userId);
    }

    forfeit(userId)
    {
        if (!this.isPlaying() || !this._playerSlots.has(userId))
        {
            return;
        }

        const opponentSlotId = this._playerSlots.get(userId) === 0 ? 1 : 0;
        const opponentUserId = this._getUserIdBySlot(opponentSlotId);

        this._server.send(userId, createMessage(MESSAGE_TYPES.DEFEAT,
            {
                status: STATUS.DEFEAT,
                reason: STATUS_REASON.FORFEITED
            })
        );

        this._server.send(opponentUserId, createMessage(MESSAGE_TYPES.VICTORY,
            {
                status: STATUS.VICTORY,
                reason: STATUS_REASON.OPPONENT_FORFEITED
            })
        );

        this.destroy();
    }

    _handleMoveResult(result, userId)
    {
        switch (result.type)
        {
            case RESULT_TYPES.MOVE:
                this._sendMove(result);
                break;

            case RESULT_TYPES.WIN:
                this._sendMove(result);
                this._finishWin(userId);
                break;

            case RESULT_TYPES.DRAW:
                this._sendMove(result);
                this._finishDraw();
                break;

            case RESULT_TYPES.OCCUPIED:
                this._sendOccupied(userId, result);
                break;
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

        this._server.broadcast(this.id, createMessage(MESSAGE_TYPES.MOVE, payload));
    }

    _sendOccupied(userId, result)
    {
        const payload = { index: result.index };

        this._server.send(userId, createMessage(MESSAGE_TYPES.OCCUPIED, payload));
    }

    _finishWin(userId)
    {
        const winnerSlotId = this._playerSlots.get(userId);
        const loserSlotId = winnerSlotId === 0 ? 1 : 0;
        const loserUserId = this._getUserIdBySlot(loserSlotId);

        this._server.send(userId, createMessage(MESSAGE_TYPES.VICTORY,
            {
                status: STATUS.VICTORY,
                reason: STATUS_REASON.WON
            })
        );

        this._server.send(loserUserId, createMessage(MESSAGE_TYPES.DEFEAT,
            {
                status: STATUS.DEFEAT,
                reason: STATUS_REASON.LOST
            })
        );

        this.destroy();
    }

    _finishDraw()
    {
        this._server.broadcast(this.id, createMessage(MESSAGE_TYPES.DRAW,
            {
                status: STATUS.DRAW,
                reason: STATUS_REASON.DRAW
            })
        );

        this.destroy();
    }

    _getUserIdBySlot(slotId)
    {
        for (const [userId, playerSlotId] of this._playerSlots)
        {
            if (playerSlotId === slotId)
            {
                return userId;
            }
        }

        return null;
    }

    _removePlayer(userId)
    {
        if (!this._playerSlots.has(userId)) return;

        const connection = this._server.getUserConnection(userId);

        if (connection)
        {
            connection.leave(this.id);
        }

        this._playerSlots.delete(userId);
        this.emit("playerRemoved", userId);
    }

    destroy()
    {
        if (this.isDestroyed()) return;

        this._status = MATCH_STATUS.DESTROYED;

        for (const userId of [...this._playerSlots.keys()])
        {
            this._removePlayer(userId);
        }

        this._game = null;
        this._availableSlotIds = [];

        this.emit("destroyed", this.id);
    }
}
