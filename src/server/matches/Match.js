import { Game } from "../../domain/Game.js";
import { PLAYERS_PER_GAME, RESULT_TYPES } from "../../domain/constants.js";


export class Match
{
    constructor(id)
    {
        this.id = id;
        this._players = new Map();
        this._game = null;
        this._nextSlotId = 0;
    }

    _getNextSlotId()
    {
        return this._nextSlotId++;
    }

    hasPlayer(userId)
    {
        return this._players.has(userId);
    }

    addPlayer(userId)
    {
        const players = this._players;

        if (players.has(userId))
        {
            return;
        }

        const slotId = this._getNextSlotId();

        players.set(userId, slotId);

        if (players.size === PLAYERS_PER_GAME)
        {
            this._game = new Game();
        }
    }

    makeMove(userId, boardIndex)
    {
        const slotId = this._players.get(userId);

        if (!this._game.isTurn(slotId))
        {
            return;
        }

        const result = this._game.move(boardIndex);

        this._handleResult(result);
    }

    _handleResult(result)
    {
        switch (result.type)
        {
            case RESULT_TYPES.MOVE:
                this._handleMoveResult(result);
                break;

            case RESULT_TYPES.WIN:
                this._handleWinResult(result);
                break;

            case RESULT_TYPES.DRAW:
                this._handleDrawResult(result);
                break;

            case RESULT_TYPES.OCCUPIED:
                this._handleOccupiedResult(result);
                break;
        }
    }

    _handleMoveResult(result)
    {
    }

    _handleWinResult(result)
    {
    }

    _handleDrawResult(result)
    {
    }

    _handleOccupiedResult(result)
    {
    }
}
