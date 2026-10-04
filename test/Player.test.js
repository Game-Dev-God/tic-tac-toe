import test from "node:test";
import assert from "node:assert/strict";

import { Player } from "../src/domain/Player.js";
import { MARKS } from "../src/domain/constants.js";


test("creates a player with a mark and zero moves", () =>
{
    const player = new Player(MARKS.X);

    assert.equal(player.mark, MARKS.X);
    assert.equal(player.moves, 0);
});


test("can represent the O player", () =>
{
    const player = new Player(MARKS.O);

    assert.equal(player.mark, MARKS.O);
    assert.equal(player.moves, 0);
});


test("increments its move count", () =>
{
    const player = new Player(MARKS.X);

    player.incMove();
    player.incMove();

    assert.equal(player.moves, 2);
});