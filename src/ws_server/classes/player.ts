import { cellStatus } from "../interfaces";
import { Ship } from "./ship";

export class Player {
  indexPlayer: number;
  ships: Ship[];
  gameId: number;
  ws: WebSocket;
  //{"x5y3": cellStatus.shot}
  shotCells: Map<string, cellStatus>;

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
    this.shotCells = new Map<string, cellStatus>();
  }
}
