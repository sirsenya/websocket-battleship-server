import { Game } from "../classes/game.js";
import { Player } from "../classes/player.js";
import { games, rooms } from "../db.js";
import { createGameInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";

export function createGame(params: {
  ws: WebSocket;
  idPlayer: number;
  gameId: number;
  players: Player[];
}): void {
  if (!games.find((game) => game?.gameId == params.gameId)) {
    games.push(
      new Game({
        gameId: params.gameId,
        players: params.players,
        turn: 0,
      })
    );
  }

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
