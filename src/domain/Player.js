export class Player
{
    constructor(mark)
    {
        this.mark = mark;
        this.moves = 0;
    }

    incMove()
    {
        this.moves++;
    }
}