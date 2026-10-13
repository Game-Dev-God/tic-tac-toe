import { USER_ACTIVITY, USER_STATUS } from "./constants.js";


export class User
{
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
        this.connectionId = null;
        this.status = USER_STATUS.OFFLINE;
        this.lastActivity = USER_ACTIVITY.IDLE;
        this.matchId = null;
    }

    setConnectionId(connectionId)
    {
        this.connectionId = connectionId;
    }

    setStatus(status)
    {
        this.status = status;
        
        return this;
    }

    setLastActivity(activity)
    {
        this.lastActivity = activity;
        
        return this;
    }

    setMatchId(matchId)
    {
        this.matchId = matchId;
        
        return this;
    }
    
    isOnline()
    {
        return this.status === USER_STATUS.ONLINE;
    }
    
    isIdle()
    {
        return  this.lastActivity === USER_ACTIVITY.IDLE;
    }
    
    isPlaying()
    {
        return  this.lastActivity === USER_ACTIVITY.PLAYING;
    }
    
    isWaitingMatch()
    {
        return  this.lastActivity === USER_ACTIVITY.WAITING_MATCH;
    }
    
    setWaitingMatch()
    {
        this.lastActivity = USER_ACTIVITY.WAITING_MATCH;
        
        return this;
    }
    
    setPlaying()
    {
        this.lastActivity = USER_ACTIVITY.PLAYING;
        
        return this;
    }
    
    setIdle()
    {
        this.lastActivity = USER_ACTIVITY.IDLE;
        
        return this;
    }
}
