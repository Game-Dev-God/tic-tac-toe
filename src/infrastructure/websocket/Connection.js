export class Connection
{
    constructor(id, socket)
    {
        this._id = id;
        this._socket = socket;
        this._userId = null;
    }

    get id()
    {
        return this._id;
    }

    get userId()
    {
        return this._userId;
    }

    setUserId(userId)
    {
        this._userId = userId;
    }

    send(data)
    {
        this._socket.send(data);
    }

    close()
    {
        this._socket.close();
    }
}