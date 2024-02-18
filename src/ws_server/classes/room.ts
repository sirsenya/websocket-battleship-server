import { Attack } from "./attack";
import { User } from "./user";

export class Room {
  roomUsers: User[];
  roomId: number;
  turn?: number;
  winner?: number;
  attack?: Attack;

  constructor(params: {
    roomUsers: User[];
    roomId: number;
    attack?: Attack;
    winner?: number;
    turn?: number;
  }) {
    this.roomUsers = params.roomUsers;
    this.roomId = params.roomId;
    this.attack = params.attack;
    this.winner = params.winner;
    this.turn = params.turn;
  }
}


