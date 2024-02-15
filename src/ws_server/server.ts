import { wss } from "../../index";

function onSocketPostError(e: Error) {
  console.error(e);
}

wss.on("connection", (ws, req) => {
  ws.on("error", onSocketPostError);
  ws.on("close", () => {
    console.log("Connection closed");
  });
  ws.onmessage = (msg) => {
    const message: { type: string; data: string } = JSON.parse(
      msg.data.toString()
    );
    const type: string = message.type;
    const data: { name: string; index: number } = JSON.parse(message.data);
    console.log(`FROM WS ${type} ${data}`);
    if (type === "reg") {
      ws.send(
        JSON.stringify({
          type: "reg",
          data: JSON.stringify({
            name: data.name,
            index: 0,
            //TODO: implement error
            error: false,
            errorText: "some error",
          }),
          id: 0,
        })
      );
      ws.send(
        JSON.stringify({
          type: "update_room",
          data: JSON.stringify([
            {
              roomId: 0,
              roomUsers: [
                {
                  name: "gay_room",
                  index: 0,
                },
              ],
            },
          ]),
          id: 0,
        })
      );
      ws.send(
        JSON.stringify({
          type: "update_winners",
          data: JSON.stringify([
            {
              name: data.name,
              wins: 0,
            },
          ]),
          id: 0,
        })
      );
    }
    if (type === "create_room") {
      ws.send(
        JSON.stringify({
          type: "update_room",
          data: JSON.stringify([
            {
              roomId: 0,
              roomUsers: [
                {
                  name: "gay_room",
                  index: 0,
                },
              ],
            },
          ]),
          id: 0,
        })
      );
    }
  };
  console.log("New client connected");
});
