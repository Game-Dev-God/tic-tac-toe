function createMessage(type, data)
{
    return JSON.stringify({ type, data });
}

function isValidMessage(parsedMessage)
{
    return (
        parsedMessage !== null &&
        typeof parsedMessage === "object" &&
        !Array.isArray(parsedMessage) &&
        typeof parsedMessage.type === "string" &&
        parsedMessage.data !== null &&
        typeof parsedMessage.data === "object" &&
        !Array.isArray(parsedMessage.data)
    );
}

function parseMessage(rawMessage)
{
    return JSON.parse(rawMessage);
}

function parseMessageSafe(rawMessage)
{
    try
    {
        const message = parseMessage(rawMessage.toString());

        return isValidMessage(message) ? message : null;
    }
    catch (error)
    {
        return null;
    }
}

function isValidIdentifyData(data)
{
    return (
        typeof data.name === "string" &&
        data.name.trim() !== "" &&
        (
            data.id === undefined ||
            data.id === null ||
            typeof data.id === "string"
        )
    );
}

function isValidMoveData(data)
{
    return Number.isInteger(data?.index);
}

export
{
    createMessage,
    isValidMessage,
    parseMessage,
    parseMessageSafe,
    isValidIdentifyData,
    isValidMoveData
};