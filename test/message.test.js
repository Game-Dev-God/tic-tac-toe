import
{
    createMessage,
    isValidMessage,
    parseMessage,
    parseMessageSafe,
    isValidIdentifyData,
    isValidMoveData
} from "../src/server/messages/message.js";

import { MESSAGE_TYPES } from "../src/server/messages/constants.js";

describe("Message envelope", () =>
{
    test("accepts a recognized type with object data", () =>
    {
        expect(
            isValidMessage(
            {
                type: MESSAGE_TYPES.MOVE,
                data: { index: 4 }
            })
        ).toBe(true);
    });

    test("rejects an unknown message type", () =>
    {
        expect(
            isValidMessage(
            {
                type: "UNKNOWN",
                data: {}
            })
        ).toBe(false);
    });

    test.each(
    [
        null,
        [],
        "MOVE",
        42,
        true
    ])("rejects an invalid top-level value: %p", (message) =>
    {
        expect(isValidMessage(message)).toBe(false);
    });

    test.each(
    [
        undefined,
        null,
        [],
        "payload",
        42,
        true
    ])("rejects invalid data: %p", (data) =>
    {
        expect(
            isValidMessage(
            {
                type: MESSAGE_TYPES.MOVE,
                data
            })
        ).toBe(false);
    });

    test("accepts an empty object as data", () =>
    {
        expect(
            isValidMessage(
            {
                type: MESSAGE_TYPES.FIND_MATCH,
                data: {}
            })
        ).toBe(true);
    });
    
    test.each(
    [
        {},
        { data: {} },
        { type: 42, data: {} },
        { type: null, data: {} }
    ])("rejects a missing or invalid type: %p", (message) =>
    {
        expect(isValidMessage(message)).toBe(false);
    });
});

describe("Message parsing", () =>
{
    test("creates a JSON message with type and data", () =>
    {
        const message = createMessage(
            MESSAGE_TYPES.MOVE,
            { index: 4 }
        );

        expect(JSON.parse(message)).toEqual(
        {
            type: MESSAGE_TYPES.MOVE,
            data: { index: 4 }
        });
    });

    test("parses valid JSON", () =>
    {
        expect(
            parseMessage(
                JSON.stringify(
                {
                    type: MESSAGE_TYPES.MOVE,
                    data: { index: 4 }
                })
            )
        ).toEqual(
        {
            type: MESSAGE_TYPES.MOVE,
            data: { index: 4 }
        });
    });

    test("returns null for malformed JSON", () =>
    {
        expect(parseMessageSafe("{invalid json")).toBeNull();
    });

    test("returns null for an unknown type", () =>
    {
        expect(
            parseMessageSafe(
                JSON.stringify(
                {
                    type: "UNKNOWN",
                    data: {}
                })
            )
        ).toBeNull();
    });

    test("returns the parsed message when the envelope is valid", () =>
    {
        const message =
        {
            type: MESSAGE_TYPES.MOVE,
            data: { index: 4 }
        };

        expect(parseMessageSafe(JSON.stringify(message))).toEqual(message);
    });
    
    test.each(
    [
        "null",
        "[]",
        '"MOVE"',
        "42",
        "true"
    ])("returns null when JSON parses to an invalid envelope: %s", (rawMessage) =>
    {
        expect(parseMessageSafe(rawMessage)).toBeNull();
    });
});

describe("IDENTIFY payload validation", () =>
{
    test("accepts a valid name and optional string ID", () =>
    {
        expect(isValidIdentifyData({ name: "Player" })).toBe(true);
        expect(isValidIdentifyData({ name: "Player", id: "user-1" })).toBe(true);
        expect(isValidIdentifyData({ name: "Player", id: null })).toBe(true);
    });

    test.each(
    [
        {},
        { name: "" },
        { name: "   " },
        { name: 42 },
        { name: "Player", id: 42 }
    ])("rejects invalid IDENTIFY data: %p", (data) =>
    {
        expect(isValidIdentifyData(data)).toBe(false);
    });
});

describe("MOVE payload validation", () =>
{
    test("accepts an integer index", () =>
    {
        expect(isValidMoveData({ index: 4 })).toBe(true);
        expect(isValidMoveData({ index: 0 })).toBe(true);
    });

    test.each(
    [
        {},
        { index: "4" },
        { index: 1.5 },
        { index: null },
        { index: undefined }
    ])("rejects an invalid MOVE payload: %p", (data) =>
    {
        expect(isValidMoveData(data)).toBe(false);
    });
});
