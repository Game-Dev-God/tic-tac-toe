import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";


const ROOT_DIRECTORY =
    fileURLToPath(new URL("../", import.meta.url));


const MIME_TYPES =
{
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css"
};


const server = createServer(
    async (request, response) =>
    {
        const pathname =
            new URL(request.url, `http://${request.headers.host}`).pathname;

        const requestedPath =
            pathname === "/"
                ? "presentation/index.html"
                : pathname.slice(1);

        const filePath =
            normalize(join(ROOT_DIRECTORY, requestedPath));

        if (!filePath.startsWith(ROOT_DIRECTORY))
        {
            response.writeHead(403);
            response.end("Forbidden");

            return;
        }

        try
        {
            const file = await readFile(filePath);
            const contentType =
                MIME_TYPES[extname(filePath)] ?? "application/octet-stream";

            response.writeHead(200, { "Content-Type": contentType });
            response.end(file);
        }
        catch
        {
            response.writeHead(404);
            response.end("Not Found");
        }
    }
);


server.listen(3000, () =>
{
    console.log("Server running at http://localhost:3000");
});