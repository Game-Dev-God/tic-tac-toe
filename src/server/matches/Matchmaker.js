import { EventEmitter } from "node:events";

export class Matchmaker extends EventEmitter
{
    constructor()
    {
        super();

        this._queue = new Map();
    }

    add(name, id)
    {
        if (this._queue.has(id)) return;
    
        const user = { name, id };
    
        this._queue.set(id, user);
    
        this.emit("added", id);
    
        this.findMatch();
    }

    remove(id)
    {
        return this._queue.delete(id);
    }

    findMatch()
    {
        if (this._queue.size < 2) return;

        const iterator = this._queue.values();
        const user1 = iterator.next().value;
        const user2 = iterator.next().value;

        this._queue.delete(user1.id);
        this._queue.delete(user2.id);

        this.emit("match", user1, user2);
    }
}