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
import { Player } from "./classes/player.js";
import { Room } from "./classes/room.js";
import { updateRoomGlobally } from "./responses/update_room.js";
import { Game } from "./classes/game.js";
import { sendResponse } from "./responses/send_response.js";

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

        const player = new Player({
          indexPlayer: userId,
          ws: ws,
          ships: [],
          gameId: gameId,
        });
        const botShips: Ship[] = addRandomShips();
        const bot = new Player({
          indexPlayer: (userId + 1) * -1,
          ws: ws,
          gameId: gameId,
          ships: botShips,
        });
        const playersRoom: number | undefined = rooms.findIndex((room) =>
          room?.roomUsers?.map((user) => user.index).includes(userId)
        );
        // console.log(playersRoom);
        if (playersRoom || playersRoom === 0) {
          delete rooms[playersRoom];
          updateRoomGlobally();
        }
        createGame({
          ws: ws,
          idPlayer: users.find((user) => user.ws === ws)!.index,
          gameId: gameId,
          players: [bot, player],
        });
        addShips({
          ships: botShips,
          ws: ws,
          indexPlayer: bot.indexPlayer,
          gameId: gameId,
        });
        break;
      }
    }
    //console.log(`users: ${users.map((user) => user.index)}`);
  };
  ws.onclose = () => {
    // console.log(`users: ${users.map((user) => user.index)}`);
    const leftUser: User | undefined = users.find((user) => user.ws === ws);

    if (leftUser) {
      const roomWithLeftUser: Room | undefined = rooms.find((room) =>
        room?.roomUsers.map((user) => user.index).includes(leftUser.index)
      );
      const gameWithLeftUser: Game | undefined = games.find((game) =>
        game?.players
          .map((player) => player.indexPlayer)
          .includes(leftUser.index)
      );
      // console.log(games.length);
      // console.log(gameWithLeftUser);

      if (roomWithLeftUser) {
        delete rooms[roomWithLeftUser.roomId];
        updateRoomGlobally();
      }

      if (gameWithLeftUser) {
        //if not a bot
        if (
          !gameWithLeftUser.players.find((player) => player.indexPlayer < 0)
        ) {
          const winner: Player = gameWithLeftUser.players.find(
            (player) => player.ws !== ws
          )!;
          sendResponse({
            ws: winner.ws,
            type: messageTypes.FINISH,
            data: {
              winPlayer: winner.indexPlayer,
            },
          });
          users.find((user) => user.index === winner.indexPlayer)!.wins++;
          updateWinners();
          delete games[gameWithLeftUser.gameId];
        }
      }

      leftUser.online = false;
      console.log(
        `user ${leftUser?.name} left. Games with him are closed, rooms are deleted`
      );
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
