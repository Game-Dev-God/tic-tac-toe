import test from "node:test";
import assert from "node:assert/strict";

import { Board } from "../src/domain/Board.js";
import { Player } from "../src/domain/Player.js";
import { MARKS } from "../src/domain/constants.js";


test("creates an empty 3x3 board", () =>
{
    const board = new Board();

    assert.equal(board.size, 3);
    assert.equal(board.isFull(), false);

    for (let index = 0; index < 9; index++)
    {
        assert.equal(board.getCell(index), null);
    }
});


test("sets and retrieves a cell", () =>
{
    const board = new Board();

    const result = board.setCell(0, MARKS.X);

    assert.equal(result, true);
    assert.equal(board.getCell(0), MARKS.X);
    assert.equal(board.isFull(), false);
});


test("returns false when setting an occupied cell", () =>
{
    const board = new Board();

    board.setCell(0, MARKS.X);

    const result = board.setCell(0, MARKS.O);

    assert.equal(result, false);
    assert.equal(board.getCell(0), MARKS.X);
    assert.equal(board.isFull(), false);
});


test("reports a full board after every cell is successfully filled", () =>
{
    const board = new Board();

    for (let index = 0; index < 9; index++)
    {
        assert.equal(board.setCell(index, MARKS.X), true);
    }

    assert.equal(board.isFull(), true);
});


test("does not report a full board before every cell is filled", () =>
{
    const board = new Board();

    for (let index = 0; index < 8; index++)
    {
        board.setCell(index, MARKS.X);
    }

    assert.equal(board.isFull(), false);
});


test("returns false when a player has fewer than three moves", () =>
{
    const board = new Board();
    const player = new Player(MARKS.X);

    board.setCell(0, MARKS.X);
    board.setCell(1, MARKS.X);

    player.incMove();
    player.incMove();

    assert.equal(board.hasWinner(player), false);
});


test("detects a horizontal win", () =>
{
    const board = new Board();
    const player = new Player(MARKS.X);

    board.setCell(0, MARKS.X);
    board.setCell(1, MARKS.X);
    board.setCell(2, MARKS.X);

    player.incMove();
    player.incMove();
    player.incMove();

    assert.equal(board.hasWinner(player), true);
});


test("detects a vertical win", () =>
{
    const board = new Board();
    const player = new Player(MARKS.X);

    board.setCell(0, MARKS.X);
    board.setCell(3, MARKS.X);
    board.setCell(6, MARKS.X);

    player.incMove();
    player.incMove();
    player.incMove();

    assert.equal(board.hasWinner(player), true);
});


test("detects a diagonal win", () =>
{
    const board = new Board();
    const player = new Player(MARKS.X);

    board.setCell(0, MARKS.X);
    board.setCell(4, MARKS.X);
    board.setCell(8, MARKS.X);

    player.incMove();
    player.incMove();
    player.incMove();

    assert.equal(board.hasWinner(player), true);
});


test("does not report another player's winning line", () =>
{
    const board = new Board();
    const player = new Player(MARKS.X);

    board.setCell(0, MARKS.O);
    board.setCell(1, MARKS.O);
    board.setCell(2, MARKS.O);

    player.incMove();
    player.incMove();
    player.incMove();

    assert.equal(board.hasWinner(player), false);
});