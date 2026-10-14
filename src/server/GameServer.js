import { Users } from "./users/Users.js";
import { USER_STATUS } from "./users/constants.js";
import { MatchService } from "./matches/MatchService.js";
import { WebSocketTransport } from "../infrastructure/websocket/WebSocketTransport.js";
import { MESSAGE_TYPES } from "./messages/constants.js";
import
{ 
    parseMessageSafe, 
    isValidIdentifyData,
    isValidMoveData
} from "./messages/message.js";

export class GameServer
{
    constructor(httpServer)
    {
        this._users = new Users();
        this._matchService = new MatchService(this);
        this._transport = new WebSocketTransport(httpServer);
    
        this._setupListeners();
    }
    
    _setupListeners()
    {
        const transport = this._transport;

        transport.on("connection", (connection) =>
        {
            this._handleConnection(connection);
        });
        
        transport.on("disconnect", (connection) =>
        {
            this._handleDisconnect(connection);
        });

        transport.on("message", (connection, data) =>
        {
            this._handleMessage(connection, data);
        });
    }

    start()
    {
        this._transport.start();
    }

    stop()
    {
        return this._transport.stop();
    }

    getUser(userId)
    {
        return this._users.get(userId);
    }

    getUserConnection(userId)
    {
        const user = this._users.get(userId);

        if (!user) return null;
    
        return this._transport.getConnection(user.connectionId);
    }

    send(userId, data)
    {
        const connection = this.getUserConnection(userId);

        if (!connection) return this;

        connection.send(data);
        
        return this;
    }
    
    sendMany(userIds, data)
    {
        if (!Array.isArray(userIds)) return this;
        
        for (let userId of userIds)
        {
            this.send(userId, data);
        }
        
        return this;
    }

    broadcast(roomId, data)
    {
        this._transport.broadcast(roomId, data);
        
        return this;
    }
    
    broadcastExcept(userId, roomId, data)
    {
        const connection = this.getUserConnection(userId);
        
        if (!connection) return this;
        
        this._transport.broadcastExcept(connection, roomId, data);
        
        return this;
    }

    _handleConnection(connection)
    {
        console.log(`Connection established: ${connection.id}`);
    }
    
    _handleDisconnect(connection)
    {
        const user = this._users.get(connection.userId);
    
        if (!user || user.connectionId !== connection.id) return;
    
        user.setStatus(USER_STATUS.OFFLINE);
    
        if (user.isWaitingMatch())
        {
            if (this._matchService.removeFromQueue(user.id))
            {
                user.setIdle();
            }
        }
    }

    _handleMessage(connection, data)
    {
        const message = parseMessageSafe(data);
    
        if (!message)
        {
            console.warn(`Invalid message from connection ${connection.id}`);
    
            return;
        }
    
        switch (message.type)
        {
            case MESSAGE_TYPES.IDENTIFY:
                this._handleIdentify(connection, message.data);
                break;
    
            case MESSAGE_TYPES.FIND_MATCH:
                this._handleFindMatch(connection);
                break;
    
            case MESSAGE_TYPES.MOVE:
                this._handleMove(connection, message.data);
                break;
    
            default:
                console.warn(
                    `Unknown message type "${message.type}" from connection ${connection.id}`
                );
        }
    }
    

    _handleIdentify(connection, data)
    {
        if (connection.userId !== null) return;

        if (!isValidIdentifyData(data)) return;
    
        const existingUser = data.id != null
            ? this._users.get(data.id)
            : null;
    
        if (existingUser?.isOnline())
        {
            const previousConnection = this._transport.getConnection(
                existingUser.connectionId
            );
    
            if (previousConnection)
            {
                previousConnection.close(1000);
            }
        }
    
        const user = this._users.join(
            data.id,
            data.name,
            connection.id
        );
    
        connection.setUserId(user.id);
    }
    
    _handleFindMatch(connection)
    {
        const user = this._users.get(connection.userId);
    
        if (!user || !user.isOnline() || !user.isIdle()) return;
    
        this._matchService.addToQueue(user);
    }
        
    _handleMove(connection, data)
    {
        if (!isValidMoveData(data)) return;
        
        const user = this._users.get(connection.userId);
    
        if (!user || !user.isOnline() || !user.isPlaying() || !user.matchId) return;
    
        this._matchService.makeMove(
            user.matchId,
            user.id,
            data.index
        );
    }
}
