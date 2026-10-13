import { DEFAULT_BOARD_SIZE, WINNING_LINES } from "./constants.js";

export class Board
{
    constructor(size = DEFAULT_BOARD_SIZE)
    {
        this._size = size;
        this._cells = Array(size * size).fill(null);
        this._remainingCells = this._cells.length;
    }

    get size()
    {
        return this._size;
    }
    
    clear()
    {
        this._cells.fill(null);
        this._remainingCells = this._cells.length;
    }

    _isValidIndex(index)
    {
        return index >= 0 && index < this._cells.length;
    }

    getCell(index)
    {
        if (!this._isValidIndex(index)) return null;
        
        return this._cells[index];
    }

    setCell(index, mark)
    {
        if (!this._isValidIndex(index) || this._cells[index] !== null)
        {
            return false;
        }

        this._cells[index] = mark;
        this._remainingCells--;
        
        return true;
    }

    hasWinner(player)
    {
        if (player.moves < this._size) return false;
        
        const lines = WINNING_LINES[this._size];
        
        for (const row of lines)
        {
            let hasWin = true;
            
            for (const index of row)
            {
                if (this._cells[index] !== player.mark)
                {
                    hasWin = false;
                    break;
                }
            }
            
            if (hasWin) return true;
        }
        
        return false;
    }

    isFull()
    {
        return this._remainingCells === 0;
    }
}
