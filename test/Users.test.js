import test from "node:test";
import assert from "node:assert/strict";

import { Users } from "../src/server/users/Users.js";
import { USER_STATUS } from "../src/server/users/constants.js";


test("starts empty", () =>
{
    const users = new Users();

    assert.equal(users.has("user-1"), false);
});


test("creates a new user when no id is provided", () =>
{
    const users = new Users();

    const user = users.join(null, "Kratos", "connection-1");

    assert.ok(user);
    assert.equal(user.name, "Kratos");
    assert.equal(typeof user.id, "string");
    assert.notEqual(user.id.length, 0);
});


test("stores a newly created user", () =>
{
    const users = new Users();

    const user = users.join(null, "Kratos", "connection-1");

    assert.equal(users.get(user.id), user);
    assert.equal(users.has(user.id), true);
});


test("sets the current connection when a user joins", () =>
{
    const users = new Users();

    const user = users.join(null, "Kratos", "connection-1");

    assert.equal(user.connectionId, "connection-1");
});


test("sets a joined user online", () =>
{
    const users = new Users();

    const user = users.join(null, "Kratos", "connection-1");

    assert.equal(user.status, USER_STATUS.ONLINE);
});


test("returns an existing user when its id is provided", () =>
{
    const users = new Users();

    const createdUser = users.join(
        null,
        "Kratos",
        "connection-1"
    );

    const existingUser = users.join(
        createdUser.id,
        "Kratos",
        "connection-2"
    );

    assert.equal(existingUser, createdUser);
    assert.equal(existingUser.connectionId, "connection-2");
    assert.equal(existingUser.status, USER_STATUS.ONLINE);
});


test("creates a user with an existing id when it is not stored", () =>
{
    const users = new Users();

    const user = users.join(
        "user-1",
        "Kratos",
        "connection-1"
    );

    assert.equal(user.id, "user-1");
    assert.equal(user.name, "Kratos");
    assert.equal(user.connectionId, "connection-1");
    assert.equal(user.status, USER_STATUS.ONLINE);
    assert.equal(users.get("user-1"), user);
});


test("can retrieve a user by id", () =>
{
    const users = new Users();

    const user = users.join(
        null,
        "Kratos",
        "connection-1"
    );

    assert.equal(users.get(user.id), user);
});


test("removes a user by id", () =>
{
    const users = new Users();

    const user = users.join(
        null,
        "Kratos",
        "connection-1"
    );

    const result = users.remove(user.id);

    assert.equal(result, true);
    assert.equal(users.has(user.id), false);
});


test("returns false when removing a user that does not exist", () =>
{
    const users = new Users();

    const result = users.remove("unknown-id");

    assert.equal(result, false);
});