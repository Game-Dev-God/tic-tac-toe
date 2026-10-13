export class Player 
{
    constructor(mark) 
    {
        this._mark = mark;
        this._moves = 0;
    }

    get mark() 
    {
        return this._mark;
    }

    get moves() 
    {
        return this._moves;
    }

    incMove() 
    {
        this._moves++;
    }

    reset() 
    {
        this._moves = 0;
    }
}
