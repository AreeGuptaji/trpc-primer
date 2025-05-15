import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { appRouter } from "./index";
import { createContext } from "./trpc";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext,
  });

  server.listen(port, () => {
    console.log(`> Server listening at http://localhost:${port}`);
  });

  // Clean up on server close
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing");
    handler.broadcastReconnectNotification();
    server.close();
  });
});
