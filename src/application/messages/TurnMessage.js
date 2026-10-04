import { MESSAGE_TYPES } from "./constants.js";


export class TurnMessage
{
    constructor(mark)
    {
        this.type = MESSAGE_TYPES.TURN;
        this.data =
        {
            mark
        };
    }
}