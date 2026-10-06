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
        const waitingMatch = this._findWaitingMatch();

        if (waitingMatch !== undefined)
        {
            return waitingMatch;
        }

        return this.createWaitingMatch();
    }

    createWaitingMatch()
    {
        const id = randomUUID();
        const match = new Match(id, this._server);

        this._waiting.set(id, match);

        match.once("started", () =>
        {
            this._activateMatch(match);
        });

        match.once("finished", () =>
        {
            this.removeActiveMatch(match.id);
        });

        return match;
    }

    getWaitingMatch(id)
    {
        return this._waiting.get(id);
    }

    hasWaitingMatch(id)
    {
        return this._waiting.has(id);
    }

    removeWaitingMatch(id)
    {
        return this._waiting.delete(id);
    }

    getActiveMatch(id)
    {
        return this._active.get(id);
    }

    hasActiveMatch(id)
    {
        return this._active.has(id);
    }

    removeActiveMatch(id)
    {
        return this._active.delete(id);
    }

    _findWaitingMatch()
    {
        const waitingMatches = this._waiting.values();
        const firstWaitingMatch = waitingMatches.next();

        return firstWaitingMatch.value;
    }

    _activateMatch(match)
    {
        this.removeWaitingMatch(match.id);

        this._active.set(match.id, match);
    }
}
