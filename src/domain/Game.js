import { Board } from "./Board.js";
import { Player } from "./Player.js";
import { MARKS, RESULT_TYPES } from "./constants.js";


export class Game
{
    constructor()
    {
        this._board = new Board();

        this._players =
        [
            new Player(MARKS.X),
            new Player(MARKS.O)
        ];

        this._currentSlot = 0;
        this._isFinished = false;

        this.result =
        {
            type: null,
            index: null,
            mark: null,
            nextTurn: null
        };
    }

    isTurn(slotId)
    {
        return slotId === this._currentSlot;
    }

    move(slotId, boardIndex)
    {
        if (this._isFinished || slotId !== this._currentSlot)
        {
            return null;
        }

        const player = this._players[this._currentSlot];
        const board = this._board;
        const result = this.result;

        if (!board.setCell(boardIndex, player.mark))
        {
            result.type = RESULT_TYPES.OCCUPIED;
            result.index = boardIndex;
            result.mark = null;
            result.nextTurn = player.mark;

            return result;
        }

        player.incMove();

        result.index = boardIndex;
        result.mark = player.mark;

        if (board.hasWinner(player))
        {
            this._isFinished = true;

            result.type = RESULT_TYPES.WIN;
            result.nextTurn = null;

            return result;
        }

        if (board.isFull())
        {
            this._isFinished = true;

            result.type = RESULT_TYPES.DRAW;
            result.nextTurn = null;

            return result;
        }

        this._switchTurn();

        result.type = RESULT_TYPES.MOVE;
        result.nextTurn = this._players[this._currentSlot].mark;

        return result;
    }

    _switchTurn()
    {
        this._currentSlot = this._currentSlot === 0 ? 1 : 0;
    }
}
