import { WebSocketServer } from "ws";
import { messageHandler } from "./message_handler.js";

function onSocketPostError(e: Error) {
  console.error(e);
}
export const wss = new WebSocketServer({ port: 3000, clientTracking: true });
wss.on("connection", messageHandler);

wss.on("error", onSocketPostError);
wss.on("close", () => {
  console.log("Connection closed");
});
