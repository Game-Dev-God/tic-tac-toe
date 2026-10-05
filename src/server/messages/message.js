function createMessage(type, data)
{
    return JSON.stringify(
        {
            type,
            data
        }
    );
}


function parseMessage(rawMessage)
{
    return JSON.parse(rawMessage);
}


export
{
    createMessage,
    parseMessage
};
