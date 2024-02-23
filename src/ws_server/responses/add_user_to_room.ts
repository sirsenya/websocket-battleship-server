import { User } from "../classes/user.js";
import { games, rooms } from "../db.js";
import { addUserToRoomInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { createGame } from "./create_game.js";
import { sendResponse } from "./send_response.js";
import { updateRoomGlobally } from "./update_room.js";

export function addUserToRoom(params: {
  indexRoom: number;
  ws: WebSocket;
  user: User;
}): void {
  if (
    !rooms.find((room) =>
      room.roomUsers.find((user) => user.index === params.user.index)
    )
  ) {
    rooms[params.indexRoom].roomUsers.push(params.user);
    const response: addUserToRoomInterface = {
      indexRoom: params.indexRoom,
    };

    sendResponse({
      ws: params.ws,
      type: messageTypes.ADD_USER_TO_ROOM,
      data: response,
    });
    updateRoomGlobally();
    rooms[params.indexRoom].roomUsers.forEach((u) =>
      createGame({ ws: u.ws, idPlayer: u.index, gameId: games.length })
    );
  }
}
