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
        const match = this._findWaitingMatch();

        if (match !== undefined)
        {
            return match;
        }

        return this._createMatch();
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

        const onWaitingDestroyed = () =>
        {
            this._removeWaitingMatch(id);
        };

        match.once("destroyed", onWaitingDestroyed);

        match.once("started", () =>
        {
            this._activateMatch(match);

            match.off("destroyed", onWaitingDestroyed);

            match.once("destroyed", () =>
            {
                this._removeActiveMatch(id);
            });
        });

        return match;
    }

    _findWaitingMatch()
    {
        return this._waiting.values().next().value;
    }

    _activateMatch(match)
    {
        this._removeWaitingMatch(match.id);

        this._active.set(match.id, match);
    }

    _removeWaitingMatch(id)
    {
        return this._waiting.delete(id);
    }

    _removeActiveMatch(id)
    {
        return this._active.delete(id);
    }
}
