import assert from "node:assert/strict";
import test from "node:test";

import { Matches } from "../src/server/matches/Matches.js";


function createServer()
{
    return {};
}


test("Matches starts empty", () =>
{
    const matches = new Matches(createServer());

    assert.equal(matches.has("unknown"), false);
});


test("create creates a match", () =>
{
    const matches = new Matches(createServer());

    const match = matches.create();

    assert.ok(match);
    assert.equal(matches.has(match.id), true);
});


test("create generates unique match ids", () =>
{
    const matches = new Matches(createServer());

    const first = matches.create();
    const second = matches.create();

    assert.notEqual(first.id, second.id);
});


test("get returns a created match", () =>
{
    const matches = new Matches(createServer());

    const match = matches.create();

    assert.equal(matches.get(match.id), match);
});


test("get returns undefined for an unknown match", () =>
{
    const matches = new Matches(createServer());

    assert.equal(matches.get("unknown"), undefined);
});


test("has returns true for an existing match", () =>
{
    const matches = new Matches(createServer());

    const match = matches.create();

    assert.equal(matches.has(match.id), true);
});


test("has returns false after a match is removed", () =>
{
    const matches = new Matches(createServer());

    const match = matches.create();

    matches.remove(match.id);

    assert.equal(matches.has(match.id), false);
});


test("remove returns true when a match exists", () =>
{
    const matches = new Matches(createServer());

    const match = matches.create();

    assert.equal(matches.remove(match.id), true);
});


test("remove returns false for an unknown match", () =>
{
    const matches = new Matches(createServer());

    assert.equal(matches.remove("unknown"), false);
});


test("created match receives the server reference", () =>
{
    const server = createServer();
    const matches = new Matches(server);

    const match = matches.create();

    assert.equal(match._server, server);
});

