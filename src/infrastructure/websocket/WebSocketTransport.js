import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";

import { WebSocketServer } from "ws";

import { Connection } from "./Connection.js";


export class WebSocketTransport extends EventEmitter
{
    constructor(port)
    {
        super();

        this._port = port;
        this._server = null;
        this._connections = new Map();
        this._rooms = new Map();
    }

    getConnection(id)
    {
        return this._connections.get(id);
    }
    
    getRoom(roomId)
    {
        return this._rooms.get(roomId);
    }

    _addConnection(socket)
    {
        const id = randomUUID();
        const connection = new Connection(id, socket, this);

        this._connections.set(id, connection);

        return connection;
    }

    start()
    {
        this._server = new WebSocketServer({port: this._port});

        this._server.on("error", (error) =>
        {
            this.emit("error", null, error);
        });

        this._server.on("connection", (socket) =>
        {
            const connection = this._addConnection(socket);

            this.emit("connection", connection);

            socket.on("message", (data) =>
            {
                this.emit("message", connection, data);
            });

            socket.on("error", (error) =>
            {
                this.emit("error", connection, error);
            });

            socket.on("close", () =>
            {
                this.emit("disconnect", connection);

                this._removeConnection(connection);
            });
        });
    }


    join(connection, roomId)
    {
        let room = this._rooms.get(roomId);

        if (!room)
        {
            room = new Set();

            this._rooms.set(roomId, room);
        }

        room.add(connection);
        
        connection._addRoom(roomId);
    }

    broadcast(roomId, data)
    {
        const room = this._rooms.get(roomId);

        if (!room) return;

        for (const connection of room)
        {
            connection.send(data);
        }
    }
    
    broadcastExcept(sender, roomId, data)
    {
        const room = this._rooms.get(roomId);
    
        if (!room) return;
    
        for (const connection of room)
        {
            if (connection !== sender)
            {
                connection.send(data);
            }
        }
    }

    _leave(connection, roomId)
    {
        const room = this._rooms.get(roomId);

        if (!room) return;

        room.delete(connection);
        
        connection._removeRoom(roomId);

        if (room.size === 0)
        {
            this._rooms.delete(roomId);
        }
    }

    _removeConnection(connection)
    {
        for (const roomId of connection.getRooms())
        {
            this._leave(connection, roomId);
        }

        this._connections.delete(connection.id);
    }
    
    stop()
    {
        if (!this._server)
        {
            return Promise.resolve();
        }
    
        const server = this._server;
        const connections = [ ...this._connections.values() ];
    
        this._connections.clear();
        this._rooms.clear();
    
        for (const connection of connections)
        {
            connection.close(1001);
        }
    
        return new Promise((resolve, reject) =>
        {
            server.close(error =>
            {
                this._server = null;
    
                if (error)
                {
                    reject(error);
                    return;
                }
    
                resolve();
            });
        });
    }
}