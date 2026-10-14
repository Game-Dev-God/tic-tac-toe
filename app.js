import express from "express";
import { createServer } from "node:http";
import { GameServer } from "./src/server/GameServer.js";

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

app.use(express.static("public"));

const gameServer = new GameServer(httpServer);

gameServer.start();

httpServer.listen(PORT, () =>
{
    console.log(`Game server listening on port ${PORT}`);
});

function shutdown()
{
    gameServer.stop().then(() =>
    {
        httpServer.close(() =>
        {
            process.exit(0);
        });
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);