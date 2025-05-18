import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { appRouter } from "./index";
import { createContext } from "./trpc";

// Separate the WebSocket server from Next.js initialization
const wss = new WebSocketServer({
  port: 3001, // Use a different port for WebSockets
  path: "/api/trpc",
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
});

console.log(`> WebSocket Server listening on ws://localhost:3001/api/trpc`);

// Clean up on server close
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing");
  handler.broadcastReconnectNotification();
  wss.close();
});
