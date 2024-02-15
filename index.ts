import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer, WebSocket } from "ws";
//import { wss } from "./src/ws_server/server.ts";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

function onSocketPreError(e: Error) {
  console.error(e);
}

export const wss = new WebSocketServer({ port: 3000, clientTracking: true });

httpServer.on("upgrade", (req, socket, head) => {
  socket.on("error", onSocketPreError);

  //perform auth
  if (!!req.headers["BadAuth"]) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    socket.removeListener("error", onSocketPreError);
    wss.emit("connection", ws, req);
  });
});
