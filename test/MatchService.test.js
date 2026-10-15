import { describe, expect, jest, test } from "@jest/globals";

import { MatchService } from "../src/server/matches/MatchService.js";
import { User } from "../src/server/users/User.js";
import { USER_STATUS, USER_ACTIVITY } from "../src/server/users/constants.js";
import { MESSAGE_TYPES } from "../src/server/messages/constants.js";
import { parseMessage } from "../src/server/messages/message.js";

describe("MatchService", () =>
{
    function createFixture()
    {
        const users = new Map();
        const connections = new Map();

        const server =
        {
            getUser: jest.fn(userId => users.get(userId)),
            getUserConnection: jest.fn(userId => connections.get(userId)),
            send: jest.fn(),
            broadcast: jest.fn(),
            broadcastExcept: jest.fn()
        };

        const service = new MatchService(server);

        function addUser(id, name)
        {
            const user = new User(id, name);
            user.setStatus(USER_STATUS.ONLINE);

            const connection =
            {
                join: jest.fn(),
                leave: jest.fn()
            };

            users.set(id, user);
            connections.set(id, connection);

            return { user, connection };
        }

        return { service, server, users, connections, addUser };
    }

    function startMatch(fixture)
    {
        const player1 = fixture.addUser("player-1", "Player One");
        const player2 = fixture.addUser("player-2", "Player Two");

        fixture.service.addToQueue(player1.user);
        fixture.service.addToQueue(player2.user);

        return { player1, player2 };
    }

    function getSentMessage(server, userId, type)
    {
        const call = server.send.mock.calls.find(
            ([recipientId, rawMessage]) =>
            {
                if (recipientId !== userId) return false;

                return parseMessage(rawMessage).type === type;
            }
        );

        return call ? parseMessage(call[1]) : undefined;
    }

    test("marks a queued user as waiting and removes them from the queue", () =>
    {
        const fixture = createFixture();
        const { user } = fixture.addUser("player-1", "Player One");

        fixture.service.addToQueue(user);

        expect(user.isWaitingMatch()).toBe(true);
        expect(fixture.service.removeFromQueue(user.id)).toBe(true);
        expect(fixture.service.removeFromQueue(user.id)).toBe(false);
    });

    test("creates a match and sends personalized snapshots", () =>
    {
        const fixture = createFixture();
        const { player1, player2 } = startMatch(fixture);

        expect(player1.user.isPlaying()).toBe(true);
        expect(player2.user.isPlaying()).toBe(true);

        expect(player1.user.matchId).toBeTruthy();
        expect(player1.user.matchId).toBe(player2.user.matchId);

        const matchId = player1.user.matchId;

        expect(player1.connection.join).toHaveBeenCalledWith(matchId);
        expect(player2.connection.join).toHaveBeenCalledWith(matchId);

        expect(fixture.server.send).toHaveBeenCalledTimes(2);

        const snapshot1 = getSentMessage(
            fixture.server,
            player1.user.id,
            MESSAGE_TYPES.SNAPSHOT
        );

        const snapshot2 = getSentMessage(
            fixture.server,
            player2.user.id,
            MESSAGE_TYPES.SNAPSHOT
        );

        expect(snapshot1.data.name).toBe("Player One");
        expect(snapshot1.data.opponent.name).toBe("Player Two");

        expect(snapshot2.data.name).toBe("Player Two");
        expect(snapshot2.data.opponent.name).toBe("Player One");
    });

    test("broadcasts valid moves and sends invalid moves only to the requester", () =>
    {
        const fixture = createFixture();
        const { player1, player2 } = startMatch(fixture);
        const matchId = player1.user.matchId;

        fixture.server.broadcast.mockClear();
        fixture.server.send.mockClear();

        fixture.service.makeMove(matchId, player1.user.id, 0);

        expect(fixture.server.broadcast).toHaveBeenCalledTimes(1);

        const moveMessage = parseMessage(
            fixture.server.broadcast.mock.calls[0][1]
        );

        expect(moveMessage.type).toBe(MESSAGE_TYPES.MOVE);
        expect(moveMessage.data.index).toBe(0);

        fixture.service.makeMove(matchId, player2.user.id, 3);

        expect(fixture.server.broadcast).toHaveBeenCalledTimes(2);

        fixture.server.broadcast.mockClear();
        fixture.server.send.mockClear();

        fixture.service.makeMove(matchId, player1.user.id, 3);

        expect(fixture.server.broadcast).not.toHaveBeenCalled();

        expect(getSentMessage(
            fixture.server,
            player1.user.id,
            MESSAGE_TYPES.INVALID_MOVE
        )).toEqual(
        {
            type: MESSAGE_TYPES.INVALID_MOVE,
            data: { index: 3 }
        });

        expect(getSentMessage(
            fixture.server,
            player2.user.id,
            MESSAGE_TYPES.INVALID_MOVE
        )).toBeUndefined();
    });

    test("ignores moves for a nonexistent match", () =>
    {
        const fixture = createFixture();

        expect(() =>
        {
            fixture.service.makeMove("missing-match", "player-1", 0);
        }).not.toThrow();

        expect(fixture.server.broadcast).not.toHaveBeenCalled();
        expect(fixture.server.send).not.toHaveBeenCalled();
    });

    test("sends victory and defeat messages and cleans up a finished match", () =>
    {
        const fixture = createFixture();
        const { player1, player2 } = startMatch(fixture);
        const matchId = player1.user.matchId;

        fixture.server.send.mockClear();
        fixture.server.broadcast.mockClear();

        const moves =
        [
            [player1.user.id, 0],
            [player2.user.id, 3],
            [player1.user.id, 1],
            [player2.user.id, 4],
            [player1.user.id, 2]
        ];

        for (const [userId, index] of moves)
        {
            fixture.service.makeMove(matchId, userId, index);
        }

        expect(getSentMessage(
            fixture.server,
            player1.user.id,
            MESSAGE_TYPES.VICTORY
        )).toBeDefined();

        expect(getSentMessage(
            fixture.server,
            player2.user.id,
            MESSAGE_TYPES.DEFEAT
        )).toBeDefined();

        for (const { user, connection } of [player1, player2])
        {
            expect(user.matchId).toBeNull();
            expect(user.isIdle()).toBe(true);
            expect(connection.leave).toHaveBeenCalledWith(matchId);
        }

        expect(fixture.service._matches.has(matchId)).toBe(false);
    });

    test("keeps an offline user's status and activity unchanged when a match finishes", () =>
    {
        const fixture = createFixture();
        const { player1, player2 } = startMatch(fixture);
        const matchId = player1.user.matchId;

        player2.user.setStatus(USER_STATUS.OFFLINE);

        const moves =
        [
            [player1.user.id, 0],
            [player2.user.id, 3],
            [player1.user.id, 1],
            [player2.user.id, 4],
            [player1.user.id, 2]
        ];

        for (const [userId, index] of moves)
        {
            fixture.service.makeMove(matchId, userId, index);
        }

        expect(player2.user.status).toBe(USER_STATUS.OFFLINE);
        expect(player2.user.lastActivity).toBe(USER_ACTIVITY.PLAYING);
        expect(player2.user.matchId).toBeNull();
        expect(player2.connection.leave).toHaveBeenCalledWith(matchId);
    });
});