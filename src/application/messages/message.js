import { IdentifyMessage } from "./IdentifyMessage.js";
import { MoveMessage } from "./MoveMessage.js";
import { TurnMessage } from "./TurnMessage.js";


function _serialize(message)
{
    return JSON.stringify(message);
}


const message =
{
    identify(id, name)
    {
        return _serialize(
            new IdentifyMessage(id, name)
        );
    },

    move(mark, index)
    {
        return _serialize(
            new MoveMessage(mark, index)
        );
    },

    turn(mark)
    {
        return _serialize(
            new TurnMessage(mark)
        );
    }
};


export { message };