import test from "node:test";
import assert from "node:assert/strict";

import { Match } from "../src/server/matches/Match.js";


test("Match starts waiting for players", () =>
{
    const match = new Match("match-1", {});

    assert.equal(
        match._isStarted,
        false
    );

    assert.equal(
        match._game,
        null
    );
});


test("Match starts when the second player joins", () =>
{
    const match = new Match("match-1", {});

    let started = false;

    match.once(
        "started",
        () =>
        {
            started = true;
        }
    );

    match.addPlayer("user-1");

    assert.equal(
        started,
        false
    );

    match.addPlayer("user-2");

    assert.equal(
        started,
        true
    );

    assert.equal(
        match._isStarted,
        true
    );

    assert.notEqual(
        match._game,
        null
    );
});


test("Match assigns a distinct slot to each player", () =>
{
    const match = new Match("match-1", {});

    match.addPlayer("user-1");
    match.addPlayer("user-2");

    const firstSlot = match._players.get("user-1");
    const secondSlot = match._players.get("user-2");

    assert.notEqual(
        firstSlot,
        secondSlot
    );

    assert.ok(
        firstSlot === 0 || firstSlot === 1
    );

    assert.ok(
        secondSlot === 0 || secondSlot === 1
    );
});


test("Match ignores a duplicate player", () =>
{
    const match = new Match("match-1", {});

    match.addPlayer("user-1");
    match.addPlayer("user-2");

    const firstSlot = match._players.get("user-1");
    const secondSlot = match._players.get("user-2");

    match.addPlayer("user-1");

    assert.equal(
        match._players.size,
        2
    );

    assert.equal(
        match._players.get("user-1"),
        firstSlot
    );

    assert.equal(
        match._players.get("user-2"),
        secondSlot
    );
});


test("Match ignores a third player after starting", () =>
{
    const match = new Match("match-1", {});

    match.addPlayer("user-1");
    match.addPlayer("user-2");

    match.addPlayer("user-3");

    assert.equal(
        match._players.size,
        2
    );

    assert.equal(
        match._players.has("user-3"),
        false
    );
});


test("Match routes a move using the player's slot", () =>
{
    const match = new Match("match-1", {});

    match.addPlayer("user-1");
    match.addPlayer("user-2");

    const firstUser =
        [...match._players.entries()]
            .find(
                ([, slotId]) =>
                {
                    return slotId === 0;
                }
            )[0];

    match.move(firstUser, 0);

    assert.equal(
        match._game.board.getCell(0),
        0
    );
});