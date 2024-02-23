import { Game } from "../classes/game.js";
import { Player } from "../classes/player.js";
import { games } from "../db.js";
import { createGameInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";

export function createGame(params: {
  ws: WebSocket;
  idPlayer: number;
  gameId: number;
}): void {
  games.push(
    new Game({
      gameId: params.gameId,
      players: new Array<Player>(),
      turn: 0,
    })
  );
  //console.log(params.idPlayer);
  const response: createGameInterface = {
    idGame: params.gameId,
    idPlayer: params.idPlayer,
  };

  sendResponse({
    ws: params.ws,
    type: messageTypes.CREATE_GAME,
    data: response,
  });
}
