import { IncomingMessage } from "http";
import {
  attackInterfaceReq,
  messageInterface,
  randomAttackInterfaceReq,
} from "./interfaces.js";
import { rooms, users } from "./db.js";
import { User } from "./classes/user.js";
import { addRandomShips, addShips } from "./responses/add_ships.js";
import { addUserToRoom } from "./responses/add_user_to_room.js";
import { attack } from "./responses/attack.js";
import { createGame } from "./responses/create_game.js";
import { createRoom } from "./responses/create_room.js";
import { register } from "./responses/register.js";
import { updateRoomGlobally } from "./responses/update_room.js";
import { updateWinners } from "./responses/update_winners.js";
import { randomAttack } from "./responses/random_attack.js";

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
        updateWinners({ ws: ws });
        break;
      }
      case messageTypes.CREATE_ROOM: {
        createRoom({ ws: ws, user: validatedUser() });
        break;
      }
      case messageTypes.ADD_USER_TO_ROOM: {
        const indexRoom = 0;
        const gameId = 0;
        const user: User = validatedUser();
        addUserToRoom({ ws: ws, indexRoom: indexRoom, user: user });
        updateRoomGlobally();
        rooms[indexRoom].roomUsers.forEach((u) =>
          createGame({ ws: u.ws, gameId: gameId, idPlayer: u.index })
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
        const attackReq: attackInterfaceReq = JSON.parse(message.data);
        attack(attackReq);
        break;
      }
      case messageTypes.RANDOM_ATTACK: {
        const randomAttackReq: randomAttackInterfaceReq = JSON.parse(
          message.data
        );
        randomAttack(randomAttackReq);
        break;
      }
      case messageTypes.SINGLE_PLAY: {
        const gameId = 0;

        createGame({
          ws: ws,
          gameId: gameId,
          idPlayer: users.find((user) => user.ws === ws)!.index,
        });
        addRandomShips();
        break;
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
  RANDOM_ATTACK = "randomAttack",
  SINGLE_PLAY = "single_play",
}
