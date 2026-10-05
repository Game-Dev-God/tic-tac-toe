import { Game } from "../../domain/Game.js";
import { PLAYERS_PER_GAME } from "../../domain/constants.js";


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
            return null;
        }

        return this._game.move(boardIndex);
    }
}
