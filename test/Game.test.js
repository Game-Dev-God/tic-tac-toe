import test from "node:test";
import assert from "node:assert/strict";

import { Game } from "../src/domain/Game.js";
import { MOVE_RESULT } from "../src/domain/constants.js";


test("Game starts with two player slots and X has the first turn", () =>
{
    const game = new Game();

    assert.equal(
        game.move(0, 0),
        MOVE_RESULT.SWITCH_TURN
    );

    assert.equal(
        game.move(0, 1),
        MOVE_RESULT.WRONG_TURN
    );
});


test("Game rejects a move from the wrong slot", () =>
{
    const game = new Game();

    assert.equal(
        game.move(1, 0),
        MOVE_RESULT.WRONG_TURN
    );
});


test("Game rejects an occupied cell without changing the turn", () =>
{
    const game = new Game();

    assert.equal(
        game.move(0, 0),
        MOVE_RESULT.SWITCH_TURN
    );

    assert.equal(
        game.move(1, 0),
        MOVE_RESULT.INVALID
    );

    assert.equal(
        game.move(1, 1),
        MOVE_RESULT.SWITCH_TURN
    );
});


test("Game detects a winning line", () =>
{
    const game = new Game();

    assert.equal(
        game.move(0, 0),
        MOVE_RESULT.SWITCH_TURN
    );

    assert.equal(
        game.move(1, 3),
        MOVE_RESULT.SWITCH_TURN
    );

    assert.equal(
        game.move(0, 1),
        MOVE_RESULT.SWITCH_TURN
    );

    assert.equal(
        game.move(1, 4),
        MOVE_RESULT.SWITCH_TURN
    );

    assert.equal(
        game.move(0, 2),
        MOVE_RESULT.WIN
    );
});


test("Game detects a draw", () =>
{
    const game = new Game();

    const moves =
    [
        [0, 0],
        [1, 1],
        [0, 2],
        [1, 4],
        [0, 3],
        [1, 5],
        [0, 7],
        [1, 6],
        [0, 8]
    ];

    let result;

    for (const [slotId, boardIndex] of moves)
    {
        result = game.move(slotId, boardIndex);
    }

    assert.equal(
        result,
        MOVE_RESULT.DRAW
    );
});
