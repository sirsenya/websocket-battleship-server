import { Game } from "../classes/game.js";
import { games } from "../db.js";
import { turnInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { randomAttack } from "./random_attack.js";
import { sendResponse } from "./send_response.js";

export function setTurn(params: {
  ws: WebSocket;
  gameId: number;
  turn: number;
}): void {
  const currentGame: Game | undefined = games.find(
    (game) => game.gameId === params.gameId
  );
  if (!currentGame) {
    throw Error("game not found");
  }
  const response: turnInterface = {
    currentPlayer: params.turn,
  };
  currentGame.turn = params.turn;
  sendResponse({
    ws: params.ws,
    type: messageTypes.TURN,
    data: response,
  });
  console.log(`currentGame.turn: ${currentGame.turn}`);
  console.log(
    `currentGame.playersId: ${currentGame.players.map(
      (player) => player.indexPlayer
    )}`
  );
  //console.log(`currentGame.turn: ${currentGame.turn}`);
}
