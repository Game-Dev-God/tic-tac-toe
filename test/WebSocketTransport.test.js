import test from "node:test";
import assert from "node:assert/strict";
import { WebSocket } from "ws";

import { WebSocketTransport } from "../src/infrastructure/websocket/WebSocketTransport.js";


test("receives a connection and its messages", async () =>
{
    const transport = new WebSocketTransport(3001);

    const connectionPromise = new Promise(
        (resolve) =>
        {
            transport.once(
                "connection",
                resolve
            );
        }
    );

    const messagePromise = new Promise(
        (resolve) =>
        {
            transport.once(
                "message",
                (connection, data) =>
                {
                    resolve(
                        {
                            connection,
                            data
                        }
                    );
                }
            );
        }
    );

    const disconnectPromise = new Promise(
        (resolve) =>
        {
            transport.once(
                "disconnect",
                resolve
            );
        }
    );

    transport.start();

    const client = new WebSocket("ws://localhost:3001");

    const openPromise = new Promise(
        (resolve) =>
        {
            client.once("open", resolve);
        }
    );

    const connection = await connectionPromise;

    await openPromise;

    client.send("hello");

    const result = await messagePromise;

    assert.strictEqual(result.connection, connection);
    assert.strictEqual(result.data.toString(), "hello");

    client.close();

    const disconnectedConnection = await disconnectPromise;

    assert.strictEqual(
        disconnectedConnection,
        connection
    );

    await transport.stop();
});