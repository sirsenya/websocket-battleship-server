import { Game } from "../classes/game.js";
import { Player } from "../classes/player.js";
import { Ship } from "../classes/ship.js";
import { shipInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";
import { setTurn } from "./turn.js";

export function startGame(params: { player: Player; game: Game }): void {
  const shipResponse: shipInterface[] = params.player.ships.map((ship) => ({
    position: ship.position,
    direction: ship.direction,
    type: ship.type,
    length: ship.length,
  }));

  const response: startGameInterface = {
    ships: shipResponse,
    currentPlayerIndex: 3,
  };
  sendResponse({
    ws: params.player.ws,
    type: messageTypes.START_GAME,
    data: response,
  });

  setTurn({
    ws: params.player.ws,
    gameId: params.game.gameId,
    turn: params.game.turn,
  });
}

interface startGameInterface {
  ships: shipInterface[];
  /* id of the player in the current game session, who have sent his ships */
  currentPlayerIndex: number;
}
