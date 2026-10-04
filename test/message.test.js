import test from "node:test";
import assert from "node:assert/strict";

import { message } from "../src/application/messages/message.js";
import { MESSAGE_TYPES } from "../src/application/messages/constants.js";
import { MARKS } from "../src/domain/constants.js";

test("creates a serialized move message", () =>
{
    const result = message.move(MARKS.X, 4);

    assert.equal(
        result,
        JSON.stringify(
            {
                type: MESSAGE_TYPES.MOVE,
                data:
                {
                    mark: MARKS.X,
                    index: 4
                }
            }
        )
    );
});

test("creates a serialized turn message", () =>
{
    const serialized = message.turn(MARKS.O);

    const result = JSON.parse(serialized);

    assert.deepStrictEqual(
        result,
        {
            type: MESSAGE_TYPES.TURN,
            data:
            {
                mark: MARKS.O
            }
        }
    );
});

test("creates a serialized identify message", () =>
{
    const result = JSON.parse(
        message.identify(
            "user-1",
            "Kratos"
        )
    );

    assert.deepEqual(
        result,
        {
            type: MESSAGE_TYPES.IDENTIFY,
            data:
            {
                id: "user-1",
                name: "Kratos"
            }
        }
    );
});