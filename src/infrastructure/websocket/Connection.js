export class Connection
{
    constructor(id, socket, transport)
    {
        this._id = id;
        this._socket = socket;
        this._transport = transport;
        this._userId = null;
        this._rooms = new Set();
    }

    get id()
    {
        return this._id;
    }

    get userId()
    {
        return this._userId;
    }

    getRooms()
    {
        return this._rooms;
    }

    setUserId(userId)
    {
        this._userId = userId;
    }

    join(roomId)
    {
        this._transport.join(this, roomId);
    }

    leave(roomId)
    {
        this._transport._leave(this, roomId);
    }

    _addRoom(roomId)
    {
        this._rooms.add(roomId);
    }

    _removeRoom(roomId)
    {
        this._rooms.delete(roomId);
    }

    send(data)
    {
        this._socket.send(data);
    }

    close(code)
    {
        this._socket.close(code);
    }
}