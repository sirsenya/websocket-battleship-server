import { User } from "./user";

export class Room {
  roomUsers: User[];
  roomId: number;
  turn?: number;
  winner?: number;

  constructor(params: {
    roomUsers: User[];
    roomId: number;

    winner?: number;
    turn?: number;
  }) {
    this.roomUsers = params.roomUsers;
    this.roomId = params.roomId;

    this.winner = params.winner;
    this.turn = params.turn;
  }
}
