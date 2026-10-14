import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { createServer } from "node:http";
import express from "express";
import WebSocket from "ws";

import { GameServer } from "../src/server/GameServer.js";
import { MESSAGE_TYPES } from "../src/server/messages/constants.js";

describe("GameServer integration", () =>
{
    let httpServer;
    let gameServer;
    let address;

    const clients = [];

    function connectClient()
    {
        return new Promise((resolve, reject) =>
        {
            const client = new WebSocket(address);

            client.once("open", () =>
            {
                clients.push(client);
                resolve(client);
            });

            client.once("error", reject);
        });
    }

    function sendMessage(client, type, data)
    {
        client.send(JSON.stringify({ type, data }));
    }

    function waitForMessage(client, expectedType)
    {
        return new Promise((resolve, reject) =>
        {
            const onMessage = (rawMessage) =>
            {
                let message;

                try
                {
                    message = JSON.parse(rawMessage.toString());
                }
                catch (error)
                {
                    cleanup();
                    reject(error);
                    return;
                }

                if (message.type !== expectedType) return;

                cleanup();
                resolve(message);
            };

            const onError = (error) =>
            {
                cleanup();
                reject(error);
            };

            const cleanup = () =>
            {
                client.off("message", onMessage);
                client.off("error", onError);
            };

            client.on("message", onMessage);
            client.on("error", onError);
        });
    }

    function waitForServerProcessing()
    {
        return new Promise(resolve => setTimeout(resolve, 50));
    }

    beforeAll(async () =>
    {
        httpServer = createServer(express());
        gameServer = new GameServer(httpServer);

        gameServer.start();

        await new Promise((resolve, reject) =>
        {
            httpServer.once("error", reject);
            httpServer.listen(0, "127.0.0.1", resolve);
        });

        address = `ws://127.0.0.1:${httpServer.address().port}`;
    });

    afterAll(async () =>
    {
        for (const client of clients)
        {
            if (client.readyState === WebSocket.OPEN)
            {
                client.close();
            }
        }

        await Promise.all(
            clients.map(client =>
                new Promise(resolve =>
                {
                    if (client.readyState === WebSocket.CLOSED)
                    {
                        resolve();
                        return;
                    }

                    client.once("close", resolve);
                })
            )
        );

        await gameServer.stop();

        await new Promise((resolve, reject) =>
        {
            httpServer.close(error =>
            {
                if (error)
                {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    });

    test(
        "identifies players, starts a match, broadcasts moves, and reports a winner",
        async () =>
        {
            const playerOne = await connectClient();
            const playerTwo = await connectClient();

            sendMessage(playerOne, MESSAGE_TYPES.IDENTIFY,
            {
                id: "player-1",
                name: "Player One"
            });

            sendMessage(playerTwo, MESSAGE_TYPES.IDENTIFY,
            {
                id: "player-2",
                name: "Player Two"
            });

            await waitForServerProcessing();

            const snapshotOnePromise = waitForMessage(
                playerOne,
                MESSAGE_TYPES.SNAPSHOT
            );

            const snapshotTwoPromise = waitForMessage(
                playerTwo,
                MESSAGE_TYPES.SNAPSHOT
            );

            sendMessage(playerOne, MESSAGE_TYPES.FIND_MATCH, {});
            sendMessage(playerTwo, MESSAGE_TYPES.FIND_MATCH, {});

            const [snapshotOne, snapshotTwo] = await Promise.all([
                snapshotOnePromise,
                snapshotTwoPromise
            ]);

            expect(snapshotOne.data.name).toBe("Player One");
            expect(snapshotOne.data.opponent.name).toBe("Player Two");
            expect(snapshotTwo.data.name).toBe("Player Two");
            expect(snapshotTwo.data.opponent.name).toBe("Player One");

            const moves =
            [
                [playerOne, 0],
                [playerTwo, 3],
                [playerOne, 1],
                [playerTwo, 4]
            ];

            for (const [client, index] of moves)
            {
                const playerOneMovePromise = waitForMessage(
                    playerOne,
                    MESSAGE_TYPES.MOVE
                );

                const playerTwoMovePromise = waitForMessage(
                    playerTwo,
                    MESSAGE_TYPES.MOVE
                );

                sendMessage(client, MESSAGE_TYPES.MOVE, { index });

                const [moveOne, moveTwo] = await Promise.all([
                    playerOneMovePromise,
                    playerTwoMovePromise
                ]);

                expect(moveOne.data.index).toBe(index);
                expect(moveTwo.data.index).toBe(index);
            }

            const playerOneMovePromise = waitForMessage(
                playerOne,
                MESSAGE_TYPES.MOVE
            );

            const playerTwoMovePromise = waitForMessage(
                playerTwo,
                MESSAGE_TYPES.MOVE
            );

            const victoryPromise = waitForMessage(
                playerOne,
                MESSAGE_TYPES.VICTORY
            );

            const defeatPromise = waitForMessage(
                playerTwo,
                MESSAGE_TYPES.DEFEAT
            );

            sendMessage(playerOne, MESSAGE_TYPES.MOVE, { index: 2 });

            const [moveOne, moveTwo, victory, defeat] = await Promise.all([
                playerOneMovePromise,
                playerTwoMovePromise,
                victoryPromise,
                defeatPromise
            ]);

            expect(moveOne.data.index).toBe(2);
            expect(moveTwo.data.index).toBe(2);
            expect(victory.data.reason).toBeDefined();
            expect(defeat.data.reason).toBeDefined();
        },
        10000
    );
});
