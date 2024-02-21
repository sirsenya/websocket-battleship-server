import { User } from "../classes/user.js";
import { rooms } from "../db.js";
import { addUserToRoomInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";

export function addUserToRoom(params: {
  indexRoom: number;
  ws: WebSocket;
  user: User;
}): void {
  rooms[params.indexRoom].roomUsers.push(params.user);
  const response: addUserToRoomInterface = {
    indexRoom: params.indexRoom,
  };

  sendResponse({
    ws: params.ws,
    type: messageTypes.ADD_USER_TO_ROOM,
    data: response,
  });
}
