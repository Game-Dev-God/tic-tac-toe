import { Board } from "./Board.js";
import { Player } from "./Player.js";
import 
{ 
    DEFAULT_BOARD_SIZE, 
    MARKS, 
    RESULT_TYPES,
    SLOT_ID_1,
    SLOT_ID_2
} from "./constants.js";

export class Game
{
    constructor(boardSize = DEFAULT_BOARD_SIZE)
    {
        this._board = new Board(boardSize);

        this._players =
        [
            new Player(MARKS.X),
            new Player(MARKS.O)
        ];

        this._currentSlotId = SLOT_ID_1;
        this._isFinished = false;

        this.result =
        {
            type: null,
            index: null,
            mark: null,
            nextTurn: null
        };
    }
    
    reset()
    {
        const result = this.result;
        result.type = null;
        result.index = null;
        result.mark = null;
        result.nextTurn = null;
        
        this._board.clear();
        this._currentSlotId = SLOT_ID_1;
        this._isFinished = false;
        
        for (let player of this._players)
        {
            player.reset();
        }
    }

    move(slotId, boardIndex)
    {
        if (this._isFinished || slotId !== this._currentSlotId)
        {
            return null;
        }

        const player = this._players[this._currentSlotId];
        const board = this._board;
        const result = this.result;

        if (!board.setCell(boardIndex, player.mark))
        {
            result.type = RESULT_TYPES.INVALID;
            result.index = boardIndex;
            result.mark = null;
            result.nextTurn = this._currentSlotId;

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
        result.nextTurn = this._currentSlotId;

        return result;
    }

    _switchTurn()
    {
        this._currentSlotId = this._currentSlotId === SLOT_ID_1 
            ? SLOT_ID_2 
            : SLOT_ID_1;
    }
}
