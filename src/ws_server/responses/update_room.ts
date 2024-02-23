import { Room } from "../classes/room";
import { User } from "../classes/user";
import { rooms, users } from "../db.js";
import { roomInterface, userInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";

export function updateRoom(params: { ws: WebSocket }): void {
  const roomsWithOneUser: Room[] = rooms.filter(
    (room) => room.roomUsers.length == 1
  );
  let response: roomInterface[] = [];
  if (roomsWithOneUser) {
    response = roomsWithOneUser.map((room: Room) => ({
      roomId: room.roomId,
      roomUsers: room.roomUsers.map((user: User) => ({
        name: user.name,
        index: user.index,
      })),
    }));
  }
  sendResponse({
    ws: params.ws,
    type: messageTypes.UPDATE_ROOM,
    data: response,
  });
}

export function updateRoomGlobally(): void {
  users.forEach((user) => updateRoom({ ws: user.ws }));
}
