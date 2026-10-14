import { randomUUID } from "node:crypto";

import { Match } from "./Match.js";
import { Matchmaker } from "./Matchmaker.js";

import { createMessage } from "../messages/message.js";
import { MESSAGE_TYPES } from "../messages/constants.js";

export class MatchService
{
    constructor(server)
    {
        this._server = server;
        this._matchmaker = new Matchmaker();
        this._matches = new Map();

        this._setupListeners();
    }

    _setupListeners()
    {
        this._matchmaker.on("added", (userId) =>
        {
            this._server.getUser(userId)?.setWaitingMatch();
        });
    
        this._matchmaker.on("match", (user1, user2) =>
        {
            this._createMatch(user1, user2);
        });
    }
    
    addToQueue(user)
    {
        this._matchmaker.add(user.name, user.id);
    }
    
    removeFromQueue(userId)
    {
        return this._matchmaker.remove(userId);
    }
    
    makeMove(matchId, userId, index)
    {
        const match = this._matches.get(matchId);
    
        if (!match) return;
    
        match.makeMove(userId, index);
    }
    
    _createMatch(user1, user2)
    {
        const matchId = randomUUID();
        const match = new Match();
    
        this._matches.set(matchId, match);
        
        const userRecord1 = this._server.getUser(user1.id);
        const userRecord2 = this._server.getUser(user2.id);
        
        userRecord1?.setMatchId(matchId).setPlaying();
        userRecord2?.setMatchId(matchId).setPlaying();
    
        const connection1 = this._server.getUserConnection(user1.id);
        const connection2 = this._server.getUserConnection(user2.id);
    
        connection1?.join(matchId);
        connection2?.join(matchId);
    
        match.on("started", (user1Id, user2Id) =>
        {
            this._server.send(
                user1Id,
                createMessage(
                    MESSAGE_TYPES.SNAPSHOT,
                    match.getSnapshot(user1Id)
                )
            );
    
            this._server.send(
                user2Id,
                createMessage(
                    MESSAGE_TYPES.SNAPSHOT,
                    match.getSnapshot(user2Id)
                )
            );
        });
    
        match.on("move", (payload) =>
        {
            this._server.broadcast(
                matchId,
                createMessage(MESSAGE_TYPES.MOVE, payload)
            );
        });
    
        match.on("invalidMove", (userId, payload) =>
        {
            this._server.send(
                userId,
                createMessage(MESSAGE_TYPES.INVALID_MOVE, payload)
            );
        });
    
        match.on("victory", (userId, payload) =>
        {
            this._server.send(
                userId,
                createMessage(MESSAGE_TYPES.VICTORY, payload)
            );
        });
    
        match.on("defeat", (userId, payload) =>
        {
            this._server.send(
                userId,
                createMessage(MESSAGE_TYPES.DEFEAT, payload)
            );
        });
    
        match.on("draw", (payload) =>
        {
            this._server.broadcast(
                matchId,
                createMessage(MESSAGE_TYPES.DRAW, payload)
            );
        });
        
        match.on("finished", (user1Id, user2Id) =>
        {
            this._finishMatch(matchId, user1Id, user2Id);
        });
            
        match.start(user1, user2);
    }
    
    _finishMatch(matchId, user1Id, user2Id)
    {
        for (const userId of [user1Id, user2Id])
        {
            const user = this._server.getUser(userId);
    
            if (!user) continue;
            
            user.setMatchId(null);
    
            if (user.isOnline())
            {
                user.setIdle();
            }
    
            const connection = this._server.getUserConnection(userId);
    
            connection?.leave(matchId);
        }
    
        this._matches.delete(matchId);
    }
}