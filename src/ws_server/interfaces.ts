import { Ship } from "./classes/ship";
import { User } from "./classes/user";

export interface regInterfaceRes {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface updateWinnersInterface {
  name: string;
  wins: number;
}

export interface roomInterface {
  roomId: number;
  roomUsers: User[];
}

export interface regInterfaceReq {
  name: string;
  index: number;
}

export interface winnerInterface {
  name: string;
  wins: number;
}

export interface messageInterface {
  type: string;
  data: string;
}

export interface createGameInterface {
  idGame: number;
  //player who've sent add_user_to_room request
  idPlayer: number;
}

export interface addUserToRoomInterface {
  indexRoom: number;
}

export interface addShipsInterface {
  gameId: number;
  ships: Ship[];
  /* id of the player in the current game session */
  indexPlayer: number;
}

export interface startGameInterface {
  ships: Ship[];
  /* id of the player in the current game session, who have sent his ships */
  currentPlayerIndex: number;
}

export interface positionInterface {
  x: number;
  y: number;
}

export interface turnInterface {
  currentPlayer: number /* id of the player in the current game session */;
}

export interface attackInterfaceReq {
  gameId: number;
  x: number;
  y: number;
}

export interface attackInterfaceRes {
  position: positionInterface;
  status: cellStatus;
}

export enum cellStatus {
  miss = "miss",
  killed = "killed",
  shot = "shot",
}
