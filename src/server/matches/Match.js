import { EventEmitter } from "node:events";

import { Game } from "../../domain/Game.js";
import { PLAYERS_PER_GAME, RESULT_TYPES } from "../../domain/constants.js";
import { MESSAGE_TYPES } from "../../application/messages/constants.js";
import { createMessage } from "../messages/message.js";


export class Match extends EventEmitter
{
    constructor(id, server)
    {
        super();

        this.id = id;
        this._server = server;
        this._players = new Map();
        this._game = null;
        this._nextSlotId = 0;
        this._finished = false;
        this._destroyed = false;
    }

    _getNextSlotId()
    {
        return this._nextSlotId++;
    }

    hasPlayer(userId)
    {
        return this._players.has(userId);
    }

    addPlayer(connection)
    {
        if (this._finished || this._destroyed)
        {
            return;
        }

        const userId = connection.userId;
        const players = this._players;

        if (players.has(userId) || players.size === PLAYERS_PER_GAME)
        {
            return;
        }

        const slotId = this._getNextSlotId();

        players.set(userId, slotId);

        connection.join(this.id);

        if (players.size === PLAYERS_PER_GAME)
        {
            this._game = new Game();

            this.emit("started");
        }
    }

    makeMove(userId, boardIndex)
    {
        if (this._game === null || this._finished || this._destroyed)
        {
            return;
        }

        const slotId = this._players.get(userId);

        if (!this._game.isTurn(slotId))
        {
            return;
        }

        const result = this._game.move(boardIndex);

        this._handleResult(result);
    }

    destroy()
    {
        if (this._destroyed)
        {
            return;
        }

        for (const userId of this._players.keys())
        {
            const connection = this._server.getUserConnection(userId);

            if (connection !== undefined)
            {
                connection.leave(this.id);
            }

            const user = this._server.getUser(userId);

            if (user !== undefined && user.matchId === this.id)
            {
                user.setMatchId(null);
            }
        }

        this._players.clear();
        this._game = null;
        this._finished = false;
        this._destroyed = true;

        this.emit("destroyed");
    }

    _handleResult(result)
    {
        let messageType;

        switch (result.type)
        {
            case RESULT_TYPES.MOVE:
                messageType = MESSAGE_TYPES.MOVE;
                break;

            case RESULT_TYPES.WIN:
                messageType = MESSAGE_TYPES.WIN;
                break;

            case RESULT_TYPES.DRAW:
                messageType = MESSAGE_TYPES.DRAW;
                break;

            case RESULT_TYPES.OCCUPIED:
                messageType = MESSAGE_TYPES.OCCUPIED;
                break;
        }

        const payload =
        {
            index: result.index,
            mark: result.mark,
            nextTurn: result.nextTurn
        };

        const message = createMessage(messageType, payload);

        this._server.broadcast(this.id, message);

        if (result.type === RESULT_TYPES.WIN ||
            result.type === RESULT_TYPES.DRAW)
        {
            this._finished = true;

            this.emit("finished");
        }
    }
}
