import { IncomingMessage } from "http";
import {
  addShipsInterface,
  addUserToRoomInterface,
  attackInterfaceReq,
  messageInterface,
  randomAttackInterfaceReq,
} from "./interfaces.js";
import { games, rooms, users } from "./db.js";
import { User } from "./classes/user.js";
import { addRandomShips, addShips } from "./responses/add_ships.js";
import { addUserToRoom } from "./responses/add_user_to_room.js";
import { attack } from "./responses/attack.js";
import { createGame } from "./responses/create_game.js";
import { createRoom } from "./responses/create_room.js";
import { register } from "./responses/register.js";
import { updateWinners } from "./responses/update_winners.js";
import { randomAttack } from "./responses/random_attack.js";
import { Ship } from "./classes/ship.js";

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
        updateWinners();
        break;
      }
      case messageTypes.CREATE_ROOM: {
        createRoom({ ws: ws, user: validatedUser() });
        break;
      }
      case messageTypes.ADD_USER_TO_ROOM: {
        const data: addUserToRoomInterface = JSON.parse(message.data);
        const user: User = validatedUser();
        addUserToRoom({ ws: ws, indexRoom: data.indexRoom, user: user });
        break;
      }
      case messageTypes.ADD_SHIPS: {
        const { gameId, ships, indexPlayer }: addShipsInterface = JSON.parse(
          message.data
        );
        addShips({
          ships: ships.map((ship) => new Ship({ ...ship })),
          indexPlayer: indexPlayer,
          ws: ws,
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
        const gameId = games.length;
        const userId: number = users.find((user) => user.ws === ws)!.index;
        const botWS = ws;
        createGame({
          ws: ws,
          idPlayer: users.find((user) => user.ws === ws)!.index,
          gameId: gameId,
        });
        addShips({
          ships: addRandomShips(),
          ws: botWS,
          indexPlayer: (userId + 1) * -1,
          gameId: gameId,
        });
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
  FINISH = "finish",
}
