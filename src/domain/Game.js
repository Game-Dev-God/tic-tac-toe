import { Board } from "./Board.js";
import { Player } from "./Player.js";
import {MARKS, RESULT_TYPES } from "./constants.js";


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

    move(boardIndex)
    {
        const player = this._players[this._currentSlot];
        const board = this._board;
        const result = this.result;

        if (!board.setCell(boardIndex, player.mark))
        {
            result.type = RESULT_TYPES.OCCUPIED;
            result.nextTurn = player.mark;
            result.index = null;
            result.mark = null;

            return result;
        }
        
        player.incMove();
        
        result.index = boardIndex;
        result.mark = player.mark; 

        if (board.hasWinner(player))
        {
            result.type = RESULT_TYPES.WIN;
            result.nextTurn = null;

            return result;
        }

        if (board.isFull())
        {
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
