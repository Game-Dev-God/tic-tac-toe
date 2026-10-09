import test from "node:test";
import assert from "node:assert/strict";

import { Server } from "../src/server/Server.js";
import { User } from "../src/server/users/User.js";
import { USER_ACTIVITY } from "../src/server/users/constants.js";


function createConnection(id, userId)
{
    return {
        id,
        userId,

        join()
        {
        },

        leave()
        {
        }
    };
}


function addUserToServer(server, id, name)
{
    const user = server._users.join(
        id,
        name,
        `connection-${id}`
    );

    const connection = createConnection(
        `connection-${id}`,
        user.id
    );

    server._joinMatch(connection);

    return { user, connection };
}


test("new users start idle", () =>
{
    const user = new User("user-1", "Player 1");

    assert.equal(
        user.lastActivity,
        USER_ACTIVITY.IDLE
    );
});


test("waiting users become playing when their match starts", () =>
{
    const server = new Server(0);

    const first = addUserToServer(server, "user-1", "Player 1");

    assert.equal(
        first.user.lastActivity,
        USER_ACTIVITY.WAITING_MATCH
    );

    const second = addUserToServer(server, "user-2", "Player 2");

    assert.equal(
        first.user.lastActivity,
        USER_ACTIVITY.PLAYING
    );

    assert.equal(
        second.user.lastActivity,
        USER_ACTIVITY.PLAYING
    );

    assert.equal(
        first.user.matchId,
        second.user.matchId
    );
});


test("destroying a match returns its users to idle", () =>
{
    const server = new Server(0);

    const first = addUserToServer(server, "user-1", "Player 1");
    const second = addUserToServer(server, "user-2", "Player 2");
    const match = server._matches.getActiveMatch(first.user.matchId);

    match.destroy();

    assert.equal(first.user.lastActivity, USER_ACTIVITY.IDLE);
    assert.equal(second.user.lastActivity, USER_ACTIVITY.IDLE);
    assert.equal(first.user.matchId, null);
    assert.equal(second.user.matchId, null);
});


test("destroying a waiting match returns its user to idle", () =>
{
    const server = new Server(0);

    const { user } = addUserToServer(server, "user-1", "Player 1");
    const match = server._matches.findMatch();

    match.destroy();

    assert.equal(user.lastActivity, USER_ACTIVITY.IDLE);
    assert.equal(user.matchId, null);
});
