import test from "node:test";
import assert from "node:assert/strict";
import { MESSAGE_TYPES } from "../src/application/messages/constants.js";
import { Server } from "../src/server/Server.js";


test("creates the server with its core subsystems", () =>
{
    const server = new Server(3001);

    assert.ok(server);
});


test("starts and stops the server", async () =>
{
    const server = new Server(3002);

    server.start();

    await server.stop();
});

test("accepts an unauthenticated connection", () =>
{
    const server = new Server(3003);

    assert.ok(server);
});

test("identifies a user from an identify message", () =>
{
    const server = new Server(3003);

    const connection =
    {
        id: "connection-1",
        userId: null,

        setUserId(userId)
        {
            this.userId = userId;
        }
    };

    const data = JSON.stringify(
        {
            type: "identify",
            data:
            {
                id: null,
                name: "Kratos"
            }
        }
    );

    server._handleMessage(
        connection,
        Buffer.from(data)
    );

    const user = server._users.get(
        connection.userId
    );

    assert.ok(user);
    assert.equal(user.name, "Kratos");
    assert.equal(user.connectionId, "connection-1");
    assert.equal(connection.userId, user.id);
});

test("associates a user with a match when the user joins", () =>
{
    const server = new Server(3004);

    const user = server._users.join(
        null,
        "Kratos",
        "connection-1"
    );

    const match = server._matches.create();

    server._joinMatch(
        user.id,
        match
    );

    assert.equal(
        user.matchId,
        match.id
    );
});