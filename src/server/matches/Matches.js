import { randomUUID } from "node:crypto";

import { Match } from "./Match.js";


export class Matches
{
    constructor(server)
    {
        this._server = server;
        this._waiting = new Map();
        this._active = new Map();
    }

    findMatch()
    {
        let match = this._waiting.values().next().value;

        if (!match)
        {
            match = this._createMatch();
        }

        return match;
    }

    getActiveMatch(id)
    {
        return this._active.get(id);
    }

    _createMatch()
    {
        const id = randomUUID();
        const match = new Match(id, this._server);

        this._waiting.set(id, match);

        match.once("started", (userIds) =>
        {
            this._waiting.delete(match.id);
            this._active.set(match.id, match);

            this._server.onMatchStarted(match.id, userIds);
        });

        match.on("playerRemoved", (userId) =>
        {
            this._server.onMatchPlayerRemoved(match.id, userId);
        });

        match.once("destroyed", () =>
        {
            this._active.delete(match.id);
            this._waiting.delete(match.id);
        });

        return match;
    }
}
