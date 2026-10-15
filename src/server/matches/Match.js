import { EventEmitter } from "node:events";

import { Game } from "../../domain/Game.js";
import
{
    DEFAULT_BOARD_SIZE,
    RESULT_TYPES,
    SLOT_ID_1,
    SLOT_ID_2
} from "../../domain/constants.js";

import { Snapshot } from "./Snapshot.js";
import
{
    MATCH_STATUS,
    STATUS_REASON
} from "./constants.js";

export class Match extends EventEmitter
{
    constructor(boardSize = DEFAULT_BOARD_SIZE)
    {
        super();

        this._boardSize = boardSize;
        this._status = MATCH_STATUS.NONE;

        this._game = null;
        this._players = new Map();
        this._snapshot = new Snapshot();
    }

    getSnapshot(userId)
    {
        return this._snapshot.getData(userId);
    }

    isPlaying()
    {
        return this._status === MATCH_STATUS.PLAYING;
    }

    start(user1, user2)
    {
        if (this._status !== MATCH_STATUS.NONE) return;

        const player1 =
        {
            id: user1.id,
            name: user1.name,
            slotId: SLOT_ID_1,
            opponentId: user2.id
        };

        const player2 =
        {
            id: user2.id,
            name: user2.name,
            slotId: SLOT_ID_2,
            opponentId: user1.id
        };

        this._players.set(player1.id,
        {
            slotId: player1.slotId,
            opponentId: player1.opponentId,
        });

        this._players.set(player2.id,
        {
            slotId: player2.slotId,
            opponentId: player2.opponentId,
        });

        this._game = new Game(this._boardSize);

        this._snapshot.initBoard(this._boardSize, this._game.getCurrentSlotId());

        this._snapshot.addPlayer(player1);
        this._snapshot.addPlayer(player2);

        this._status = MATCH_STATUS.PLAYING;

        this.emit("started", player1.id, player2.id);
    }

    makeMove(userId, boardIndex)
    {
        if (!this.isPlaying() || !this._players.has(userId))
        {
            return;
        }

        const slotId = this._players.get(userId).slotId;
        const result = this._game.move(slotId, boardIndex);

        if (!result) return;

        this._handleResult(result, userId);
    }

    _handleResult(result, userId)
    {
        switch (result.type)
        {
            case RESULT_TYPES.INVALID:
            {
                this.emit("invalidMove", userId,
                {
                    index: result.index
                });

                return;
            }

            case RESULT_TYPES.MOVE:
            case RESULT_TYPES.WIN:
            case RESULT_TYPES.DRAW:
            {
                const payload =
                {
                    index: result.index,
                    mark: result.mark,
                    nextTurn: result.nextTurn
                };

                this._snapshot.update(
                    result.index,
                    result.mark,
                    result.nextTurn
                );

                this.emit("move", payload);

                if (result.type === RESULT_TYPES.MOVE) return;

                this._status = MATCH_STATUS.FINISHED;

                if (result.type === RESULT_TYPES.WIN)
                {
                    this._finishWin(userId);
                }
                else
                {
                    this._finishDraw();
                }
                
                const [user1Id, user2Id] = [...this._players.keys()];
                
                this.emit("finished", user1Id, user2Id, result.type);
                
                return;
            }
        }
    }

    _finishWin(userId)
    {
        const loserUserId = this._players.get(userId).opponentId;
    
        this.emit("victory", userId,
        {
            reason: STATUS_REASON.WON
        });

        this.emit("defeat", loserUserId,
        {
            reason: STATUS_REASON.LOST
        });
    }

    _finishDraw()
    {
        this.emit("draw",
        {
            reason: STATUS_REASON.DRAW
        });
    }
}