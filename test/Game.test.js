import { Game } from "../src/domain/Game.js";
import
{
    MARKS,
    RESULT_TYPES,
    SLOT_ID_1,
    SLOT_ID_2
} from "../src/domain/constants.js";

describe("Tic-Tac-Toe Game Engine", () =>
{
    let game;

    beforeEach(() =>
    {
        game = new Game(3);
    });

    test("should allow valid moves and switch turns correctly", () =>
    {
        const result = game.move(SLOT_ID_1, 0);

        expect(result.type).toBe(RESULT_TYPES.MOVE);
        expect(result.mark).toBe(MARKS.X);
        expect(result.index).toBe(0);
        expect(result.nextTurn).toBe(MARKS.O);
    });

    test("should reject out-of-bound indices", () =>
    {
        const result = game.move(SLOT_ID_1, 99);

        expect(result.type).toBe(RESULT_TYPES.INVALID);
    });

    test("should reject moves on already occupied cells", () =>
    {
        game.move(SLOT_ID_1, 0);

        const result = game.move(SLOT_ID_2, 0);

        expect(result.type).toBe(RESULT_TYPES.INVALID);
    });

    test("should reject moves from the wrong player", () =>
    {
        game.move(SLOT_ID_1, 0);

        const result = game.move(SLOT_ID_1, 1);

        expect(result).toBeNull();
    });

    test("should detect a win condition", () =>
    {
        game.move(SLOT_ID_1, 0);
        game.move(SLOT_ID_2, 3);
        game.move(SLOT_ID_1, 1);
        game.move(SLOT_ID_2, 4);

        const result = game.move(SLOT_ID_1, 2);

        expect(result.type).toBe(RESULT_TYPES.WIN);
        expect(result.mark).toBe(MARKS.X);
        expect(result.nextTurn).toBeNull();
    });

    test("should reject moves after a win", () =>
    {
        game.move(SLOT_ID_1, 0);
        game.move(SLOT_ID_2, 3);
        game.move(SLOT_ID_1, 1);
        game.move(SLOT_ID_2, 4);
        game.move(SLOT_ID_1, 2);

        const result = game.move(SLOT_ID_2, 5);

        expect(result).toBeNull();
    });

    test("should detect a draw", () =>
    {
        game.move(SLOT_ID_1, 0); // X
        game.move(SLOT_ID_2, 1); // O
        game.move(SLOT_ID_1, 2); // X
        game.move(SLOT_ID_2, 4); // O
        game.move(SLOT_ID_1, 3); // X
        game.move(SLOT_ID_2, 5); // O
        game.move(SLOT_ID_1, 7); // X
        game.move(SLOT_ID_2, 6); // O
        const result = game.move(SLOT_ID_1, 8); // X

        expect(result.type).toBe(RESULT_TYPES.DRAW);
        expect(result.nextTurn).toBeNull();
    });

    test("should clear the board on reset", () =>
    {
        game.move(SLOT_ID_1, 0);
        game.reset();
    
        const result = game.move(SLOT_ID_1, 0);
    
        expect(result.type).toBe(RESULT_TYPES.MOVE);
        expect(result.mark).toBe(MARKS.X);
        expect(result.index).toBe(0);
    });
    
    test("should reset player move counts", () =>
    {
        game.move(SLOT_ID_1, 0);
        game.move(SLOT_ID_2, 3);
        game.reset();
    
        game.move(SLOT_ID_1, 0);
        game.move(SLOT_ID_2, 3);
        game.move(SLOT_ID_1, 1);
    
        const result = game.move(SLOT_ID_2, 4);
    
        expect(result.type).toBe(RESULT_TYPES.MOVE);
        expect(result.mark).toBe(MARKS.O);
    });
    
    test("should restore the first player's turn on reset", () =>
    {
        game.move(SLOT_ID_1, 0);
        game.reset();
    
        const result = game.move(SLOT_ID_1, 1);
    
        expect(result.type).toBe(RESULT_TYPES.MOVE);
        expect(result.mark).toBe(MARKS.X);
        expect(result.nextTurn).toBe(MARKS.O);
    });
    
    test("should clear the previous result on reset", () =>
    {
        game.move(SLOT_ID_1, 0);
        game.reset();
    
        expect(game.result.type).toBeNull();
        expect(game.result.index).toBeNull();
        expect(game.result.mark).toBeNull();
        expect(game.result.nextTurn).toBeNull();
    });
    
    test("should allow a new game after a win and reset", () =>
    {
        game.move(SLOT_ID_1, 0);
        game.move(SLOT_ID_2, 3);
        game.move(SLOT_ID_1, 1);
        game.move(SLOT_ID_2, 4);
        game.move(SLOT_ID_1, 2);
    
        game.reset();
    
        const result = game.move(SLOT_ID_1, 0);
    
        expect(result.type).toBe(RESULT_TYPES.MOVE);
        expect(result.mark).toBe(MARKS.X);
        expect(result.nextTurn).toBe(MARKS.O);
    });
    
    test("should reject negative indices", () =>
    {
        const result = game.move(SLOT_ID_1, -1);
    
        expect(result.type).toBe(RESULT_TYPES.INVALID);
    });
    
    test("should reject indices beyond the board", () =>
    {
        const result = game.move(SLOT_ID_1, 9);
    
        expect(result.type).toBe(RESULT_TYPES.INVALID);
    });
    
    test("should preserve the turn and board after an invalid move", () =>
    {
        const rejected = game.move(SLOT_ID_1, 99);
    
        expect(rejected.type).toBe(RESULT_TYPES.INVALID);
    
        const result = game.move(SLOT_ID_1, 0);
    
        expect(result.type).toBe(RESULT_TYPES.MOVE);
        expect(result.mark).toBe(MARKS.X);
        expect(result.index).toBe(0);
        expect(result.nextTurn).toBe(MARKS.O);
    });
});