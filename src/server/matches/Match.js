import { EventEmitter } from "node:events";

import { Game } from "../../domain/Game.js";
import { MOVE_RESULT } from "../../domain/constants.js";


export class Match extends EventEmitter
{
    constructor(id, server, timeoutMs = 60_000)
    {
        super();

        this.id = id;
        this._server = server;
        this._players = new Map();
        this._game = null;
        this._isStarted = false;

        this._expireTimer = setTimeout(() =>
            {
                if (!this._isStarted)
                {
                    this.emit("timeout");
                }
            },
            timeoutMs
        );
    }

    addPlayer(userId)
    {
        if (this._isStarted || this._players.has(userId))
        {
            return;
        }

        this._players.set(userId, null);

        if (this._players.size === 2)
        {
            this._start();
        }
    }

    move(userId, boardIndex)
    {
        if (!this._isStarted)
        {
            return;
        }

        const slotId = this._players.get(userId);

        if (!slotId) return;
    
        const result = this._game.move(
            slotId,
            boardIndex
        );

        switch (result)
        {
            case MOVE_RESULT.WRONG_TURN:
                this._handleWrongTurnResult();
                break;

            case MOVE_RESULT.SWITCH_TURN:
                this._handleTurnResult();
                break;

            case MOVE_RESULT.WIN:
                this._handleWinResult();
                break;

            case MOVE_RESULT.DRAW:
                this._handleDrawResult();
                break;

            case MOVE_RESULT.INVALID:
                this._handleInvalidResult(userId);
                break;
        }
    }

    _start()
    {
        clearTimeout(this._expireTimer);

        const userIds = [...this._players.keys()];

        if (Math.random() < 0.5)
        {
            const first = userIds[0];

            userIds[0] = userIds[1];
            userIds[1] = first;
        }

        this._players.set(userIds[0], 0);
        this._players.set(userIds[1], 1);

        this._game = new Game();
        this._isStarted = true;

        this.emit("started");
    }

    _handleWrongTurnResult()
    {
    }

    _handleTurnResult()
    {
    }

    _handleWinResult()
    {
        this._isStarted = false;

        this.emit("finished");
    }

    _handleDrawResult()
    {
        this._isStarted = false;

        this.emit("finished");
    }

    _handleInvalidResult(userId)
    {
    }
}