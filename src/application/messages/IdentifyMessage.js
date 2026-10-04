import { MESSAGE_TYPES } from "./constants.js";


export class IdentifyMessage
{
    constructor(id, name)
    {
        this.type = MESSAGE_TYPES.IDENTIFY;
        this.data =
        {
            id,
            name
        };
    }
}