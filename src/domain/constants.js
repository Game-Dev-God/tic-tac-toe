export const MARKS =
{
    X: 0,
    O: 1,
    LIST: [0, 1]
};


export const MOVE_RESULT =
{
    SWITCH_TURN: 0,
    WIN: 1,
    DRAW: 2,
    INVALID: 3,
    WRONG_TURN: 4
};


export const BOARD_SIZES = [3, 4];

export const DEFAULT_BOARD_SIZE = BOARD_SIZES[0];


export const WINNING_LINES =
{
    3:
    [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ],

    4:
    [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [0, 5, 10, 15],
        [3, 6, 9, 12]
    ]
};


export const PLAYERS_PER_GAME = 2;