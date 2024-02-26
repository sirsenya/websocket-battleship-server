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
  const userIndex = users.length;

  const regData: regInterfaceRes = {
    name: data.name,
    index: userIndex,
    error: true,
    errorText: "wrong password",
  };

  const userByName: User | undefined = users.find(
    (user) => user.name === data.name
  );

  if (!userByName) {
    (regData.error = false), (regData.errorText = "no error");
    addUserToDB({
      user: new User({
        name: data.name,
        index: userIndex,
        wins: 0,
        ws: params.ws,
        password: data.password,
        online: true,
      }),
      ws: params.ws,
    });
  } else {
    if (userByName.password === data.password) {
      if (userByName.online) {
        regData.errorText = "user with this name is already online";
      } else {
        (regData.error = false), (regData.errorText = "no error");
        userByName.ws = params.ws;
      }
    }
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
  password: string;
}
