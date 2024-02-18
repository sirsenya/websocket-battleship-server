import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from "ws";
import { messageHandler } from "./src/ws_server/message_handler.js";

const HTTP_PORT = 8181;

export const wss = new WebSocketServer({ port: 3000, clientTracking: true });
wss.on("connection", messageHandler);

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
