import { USER_STATUS } from "./constants.js";


export class User
{
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
        this.connectionId = null;
        this.status = USER_STATUS.OFFLINE;
        this.matchId = null;
    }

    setConnectionId(connectionId)
    {
        this.connectionId = connectionId;
    }

    setStatus(status)
    {
        this.status = status;
    }

    setMatchId(matchId)
    {
        this.matchId = matchId;
    }
}