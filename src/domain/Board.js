import { BOARD_SIZE, WINNING_LINES } from "./constants.js";


export class Board
{
    constructor()
    {
        this._cells = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
        this._remainingCells = this._cells.length;
        this.lastIndex = null;
    }

    get size()
    {
        return BOARD_SIZE;
    }

    getCell(index)
    {
        return this._cells[index];
    }

    setCell(index, mark)
    {
        if (this._cells[index] !== null)
        {
            return false;
        }

        this._cells[index] = mark;
        this._remainingCells--;
        this.lastIndex = index;

        return true;
    }

    hasWinner(player)
    {
        if (player.moves < 3)
        {
            return false;
        }

        return WINNING_LINES[BOARD_SIZE].some(
            (line) =>
            {
                return line.every(
                    (index) =>
                    {
                        return this._cells[index] === player.mark;
                    }
                );
            }
        );
    }

    isFull()
    {
        return this._remainingCells === 0;
    }
}