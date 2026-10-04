import test from "node:test";
import assert from "node:assert/strict";

import { Connection } from "../src/infrastructure/websocket/Connection.js";


test("starts without a user", () =>
{
    const connection = new Connection(
        "connection-1",
        {}
    );

    assert.equal(connection.userId, null);
});


test("can associate a user", () =>
{
    const connection = new Connection(
        "connection-1",
        {}
    );

    connection.setUserId("user-1");

    assert.equal(connection.userId, "user-1");
});