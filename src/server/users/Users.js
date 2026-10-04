import { randomUUID } from "node:crypto";

import { User } from "./User.js";
import { USER_STATUS } from "./constants.js";


export class Users
{
    constructor()
    {
        this._users = new Map();
    }

    join(id, name, connectionId)
    {
        const user = id !== null && this._users.has(id)
            ? this._users.get(id)
            : this._create(id ?? randomUUID(), name);
    
        user.setConnectionId(connectionId);
        user.setStatus(USER_STATUS.ONLINE);
    
        return user;
    }
    get(id)
    {
        return this._users.get(id);
    }

    has(id)
    {
        return this._users.has(id);
    }

    remove(id)
    {
        return this._users.delete(id);
    }

    _create(id, name)
    {
        const user = new User(id, name);

        this._users.set(id, user);

        return user;
    }
}