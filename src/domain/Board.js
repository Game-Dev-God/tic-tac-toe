import { BOARD_SIZE } from "./constants.js";

const WINNING_LINES =
[
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

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

        return WINNING_LINES.some(
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