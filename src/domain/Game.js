import { Board } from "./Board.js";
import { Player } from "./Player.js";
import
{
    MARKS,
    MOVE_RESULT
}
from "./constants.js";


export class Game
{
    constructor()
    {
        this._board = new Board();

        this._players =
        [
            new Player(MARKS.LIST[0]),
            new Player(MARKS.LIST[1])
        ];

        this._currentSlot = 0;
    }

    move(slotId, boardIndex)
    {
        if (slotId !== this._currentSlot)
        {
            return MOVE_RESULT.WRONG_TURN;
        }

        const player = this._players[slotId];

        if (!this._board.setCell(boardIndex, player.mark))
        {
            return MOVE_RESULT.INVALID;
        }

        player.incMove();

        if (this._board.hasWinner(player))
        {
            return MOVE_RESULT.WIN;
        }

        if (this._board.isFull())
        {
            return MOVE_RESULT.DRAW;
        }

        this._switchTurn();

        return MOVE_RESULT.SWITCH_TURN;
    }

    _switchTurn()
    {
        this._currentSlot = this._currentSlot === 0 ? 1 : 0;
    }
}