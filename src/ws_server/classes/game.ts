import { Player } from "./player";

export class Game {
  gameId: number;
  players: Player[];
  turn: number;

  constructor(params: { gameId: number; players: Player[]; turn: number }) {
    this.gameId = params.gameId;
    this.players = params.players;
    this.turn = params.turn;
  }
}
