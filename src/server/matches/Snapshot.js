export class Snapshot
{
    constructor()
    {
        this._boardSize = 0;
        this._board = null;
        this._currentSlotTurn = null;
        this._players = {};
    }

    initBoard(size, firstTurn)
    {
        this._boardSize = size;
        this._board = new Array(size * size).fill(null);
        this._currentSlotTurn = firstTurn;
    }

    update(index, mark, nextTurn)
    {
        this._board[index] = mark;
        this._currentSlotTurn = nextTurn;
    }

    addPlayer(player)
    {
        this._players[player.id] =
        {
            id: player.id,
            name: player.name,
            slotId: player.slotId,
            opponentId: player.opponentId
        };
    }

    getData(userId)
    {
        const player = this._players[userId];
        const opponent = this._players[player.opponentId];

        return {
            board: [...this._board],
            boardSize: this._boardSize,
            currentSlotTurn: this._currentSlotTurn,
            id: player.id,
            name: player.name,
            slotId: player.slotId,
            opponent:
            {
                id: opponent.id,
                name: opponent.name,
                slotId: opponent.slotId
            }
        };
    }
}