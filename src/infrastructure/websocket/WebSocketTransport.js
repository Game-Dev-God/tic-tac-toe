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
    }
    
    getConnection(id)
    {
        return this._connections.get(id);
    }

    start()
    {
        this._server = new WebSocketServer(
            {
                port: this._port
            }
        );

        this._server.on("error", (error) =>
        {
            this.emit("error", null, error);
        });

        this._server.on("connection", (socket) =>
        {
            const id = randomUUID();
            const connection = new Connection(id, socket);

            this._connections.set(id, connection);

            this.emit("connection", connection);

            socket.on("message", (data) =>
            {
                this.emit("message", connection, data);
            });

            // Prevent unhandled socket errors from crashing the server
            socket.on("error", (error) =>
            {
                this.emit("error", connection, error);
            });

            socket.on("close", () =>
            {
                this._connections.delete(connection.id);

                this.emit("disconnect", connection);
            });
        });
    }


    stop()
    {
        // Guard against calling stop before start, or calling it twice
        if (!this._server)
        {
            return Promise.resolve();
        }

        // 1001 indicates the server is shutting down or restarting
        for (const connection of this._connections.values())
        {
            connection.close(1001);
        }
    
        // Immediately drop references to allow the Garbage Collector
        // to reclaim memory without waiting for socket close events
        this._connections.clear();
    
        return new Promise(
            (resolve, reject) =>
            {
                this._server.close(
                    (error) =>
                    {
                        if (error)
                        {
                            return reject(error);
                        }

                        this._server = null;
                        resolve();
                    }
                );
            }
        );
    }

}