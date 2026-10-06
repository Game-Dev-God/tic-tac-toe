import { Users } from "./users/Users.js";
import { Matches } from "./matches/Matches.js";
import { WebSocketTransport } from "../infrastructure/websocket/WebSocketTransport.js";
import { MESSAGE_TYPES } from "../application/messages/constants.js";


export class Server
{
    constructor(port)
    {
        this._users = new Users();
        this._matches = new Matches(this);
        this._transport = new WebSocketTransport(port);

        this._initialize();
    }

    start()
    {
        this._transport.start();
    }

    stop()
    {
        return this._transport.stop();
    }

    send(userId, data)
    {
        const user = this._users.get(userId);

        if (user === undefined)
        {
            return;
        }

        const connection = this._transport.getConnection(
            user.connectionId
        );

        if (connection === undefined)
        {
            return;
        }

        connection.send(data);
    }

    broadcast(roomId, data)
    {
        this._transport.broadcast(roomId, data);
    }

    _initialize()
    {
        const transport = this._transport;

        transport.on(
            "connection",
            (connection) =>
            {
                this._handleConnection(connection);
            }
        );

        transport.on(
            "message",
            (connection, data) =>
            {
                this._handleMessage(connection, data);
            }
        );
    }

    _handleConnection(connection)
    {
        if (connection.userId === null)
        {
            return;
        }
    }

    _handleMessage(connection, data)
    {
        const message = JSON.parse(
            data.toString()
        );

        switch (message.type)
        {
            case MESSAGE_TYPES.IDENTIFY:
                this._handleIdentify(
                    connection,
                    message.data
                );
                break;

            case MESSAGE_TYPES.MOVE:
                this._handleMove(
                    connection,
                    message.data
                );
                break;
        }
    }

    _handleIdentify(connection, data)
    {
        const user = this._users.join(
            data.id,
            data.name,
            connection.id
        );

        connection.setUserId(user.id);

        this._joinMatch(connection);
    }

    _handleMove(connection, data)
    {
        const userId = connection.userId;

        if (userId === null)
        {
            return;
        }

        const user = this._users.get(userId);

        if (user === undefined || user.matchId === null)
        {
            return;
        }

        const match = this._matches.getActiveMatch(
            user.matchId
        );

        if (match === undefined)
        {
            return;
        }

        match.makeMove(
            userId,
            data.index
        );
    }

    _joinMatch(connection)
    {
        const userId = connection.userId;

        if (userId === null)
        {
            return;
        }

        const user = this._users.get(userId);

        if (user === undefined)
        {
            return;
        }

        const match = this._matches.findMatch();

        match.addPlayer(connection);

        user.setMatchId(match.id);
    }
}
