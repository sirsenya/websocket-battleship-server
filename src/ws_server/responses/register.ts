import { User } from "../classes/user.js";
import { addUserToDB, users } from "../db.js";
import { messageInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";
import { updateRoomGlobally } from "./update_room.js";

export function register(params: {
  message: messageInterface;
  ws: WebSocket;
}): void {
  const data: regInterfaceReq = JSON.parse(params.message.data);

  const regData: regInterfaceRes = {
    ...data,
    error: true,
    errorText: "name is occupied",
  };

  if (!users.find((user) => user.name === data.name)) {
    (regData.error = false), (regData.errorText = "no error");
    addUserToDB({
      user: new User({
        name: data.name,
        index: users.length,
        wins: 0,
        ws: params.ws,
      }),
      ws: params.ws,
    });
  }

  sendResponse({ ws: params.ws, type: messageTypes.REG, data: regData });
  updateRoomGlobally();
}

interface regInterfaceRes {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

interface regInterfaceReq {
  name: string;
  index: number;
}
