import { Game } from "../classes/game.js";
import { Player } from "../classes/player.js";
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
  const room = rooms[params.indexRoom];
  //if user tries to connect to its own room
  if (room.roomUsers.map((user) => user.index).includes(params.user.index)) {
    return;
  }
  room.roomUsers.push(params.user);
  const response: addUserToRoomInterface = {
    indexRoom: params.indexRoom,
  };

  sendResponse({
    ws: params.ws,
    type: messageTypes.ADD_USER_TO_ROOM,
    data: response,
  });

  const players: Player[] = room.roomUsers.map(
    (user) =>
      new Player({
        indexPlayer: user.index,
        ships: [],
        gameId: params.indexRoom,
        ws: user.ws,
      })
  );
  delete rooms[params.indexRoom];
  const joinedUserRoom: number | undefined = rooms.findIndex((room) =>
    room?.roomUsers?.map((user) => user.index).includes(params.user.index)
  );

  if (joinedUserRoom) {
    delete rooms[joinedUserRoom];
  }
  updateRoomGlobally();
  const gameId: number = games.length;
  room.roomUsers.forEach((u) =>
    createGame({
      ws: u.ws,
      idPlayer: u.index,
      gameId: gameId,
      players: players,
    })
  );
}
