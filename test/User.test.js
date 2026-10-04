import test from "node:test";
import assert from "node:assert/strict";

import { User } from "../src/server/users/User.js";


test("creates a user with an id and name", () =>
{
    const user = new User("user-1", "Kratos");

    assert.equal(user.id, "user-1");
    assert.equal(user.name, "Kratos");
});


test("starts without a connection", () =>
{
    const user = new User("user-1", "Kratos");

    assert.equal(user.connectionId, null);
});


test("starts without a match", () =>
{
    const user = new User("user-1", "Kratos");

    assert.equal(user.matchId, null);
});