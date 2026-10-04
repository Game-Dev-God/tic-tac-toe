import { MESSAGE_TYPES } from "./constants.js";


export class MoveMessage
{
    constructor(mark, index)
    {
        this.type = MESSAGE_TYPES.MOVE;
        this.data =
        {
            mark,
            index
        };
    }
}