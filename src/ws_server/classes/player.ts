import { Ship } from "./ship";

export class Player {
  indexPlayer: number;
  ships: Ship[];
  gameId: number;
  ws: WebSocket;

  constructor(params: {
    indexPlayer: number;
    ships: Ship[];
    gameId: number;
    ws: WebSocket;
  }) {
    this.indexPlayer = params.indexPlayer;
    this.ships = params.ships;
    this.gameId = params.gameId;
    this.ws = params.ws;
  }
}
