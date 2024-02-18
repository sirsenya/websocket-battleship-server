import { IncomingMessage } from "http";
import { messageInterface } from "./interfaces.js";
import {
  addShips,
  addUserToRoom,
  createGame,
  createRoom,
  register,
  updateRoom,
  updateRoomGlobally,
  updateWinners,
  attack,
} from "./responses.js";
import { rooms, users } from "./db.js";
import { User } from "./classes/user.js";

export function messageHandler(ws: WebSocket, req: IncomingMessage) {
  ws.onmessage = (msg: MessageEvent) => {
    const message: messageInterface = JSON.parse(msg.data.toString());
    const type: string = message.type;

    function validatedUser(): User {
      const userWithThisWs: User | undefined = users.find(
        (user) => user.ws === ws
      );
      if (!userWithThisWs) {
        throw Error("User with this ws not found (from create room)");
      } else {
        return userWithThisWs;
      }
    }

    switch (type) {
      case messageTypes.REG: {
        register({ message: message, ws: ws });
        updateRoom({ ws: ws });
        updateWinners({ ws: ws });
        break;
      }
      case messageTypes.CREATE_ROOM: {
        createRoom({ ws: ws, user: validatedUser() });
        updateRoomGlobally();
        break;
      }
      case messageTypes.ADD_USER_TO_ROOM: {
        const indexRoom = 0;
        const gameId = 0;
        const user: User = validatedUser();
        addUserToRoom({ ws: ws, indexRoom: indexRoom, user: user });
        updateRoomGlobally();
        rooms[indexRoom].roomUsers.forEach((user) =>
          createGame({ ws: user.ws, gameId: gameId, idPlayer: user.index })
        );
        break;
      }
      case messageTypes.ADD_SHIPS: {
        const gameId = 0;
        addShips({
          ws: ws,
          message: message,
          gameId: gameId,
        });
        break;
      }
      case messageTypes.ATTACK: {
        attack({ ws: ws, message: message });
      }
    }
  };
}

export enum messageTypes {
  REG = "reg",
  UPDATE_ROOM = "update_room",
  CREATE_ROOM = "create_room",
  UPDATE_WINNERS = "update_winners",
  ADD_USER_TO_ROOM = "add_user_to_room",
  CREATE_GAME = "create_game",
  ADD_SHIPS = "add_ships",
  START_GAME = "start_game",
  TURN = "turn",
  ATTACK = "attack",
}
