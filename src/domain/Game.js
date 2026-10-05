import { Board } from "./Board.js";
import { Player } from "./Player.js";
import
{
    MARKS,
    RESULT_TYPES
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

        this.result =
        {
            type: null,
            index: null,
            mark: null,
            nextTurn: null
        };
    }

    move(boardIndex)
    {
        const player = this._players[this._currentSlot];

        this.result.index = boardIndex;
        this.result.mark = player.mark;
        if (!this._board.setCell(boardIndex, player.mark))
        {
            this.result.type = RESULT_TYPES.OCCUPIED;
            this.result.nextTurn = player.mark;

            return;
        }

        player.incMove();

        if (this._board.hasWinner(player))
        {
            this.result.type = RESULT_TYPES.WIN;
            this.result.nextTurn = null;

            return;
        }

        if (this._board.isFull())
        {
            this.result.type = RESULT_TYPES.DRAW;
            this.result.nextTurn = null;

            return;
        }

        this._switchTurn();

        this.result.type = RESULT_TYPES.MOVE;
        this.result.nextTurn = this._players[this._currentSlot].mark;
    }

    _switchTurn()
    {
        this._currentSlot = this._currentSlot === 0 ? 1 : 0;
    }
}