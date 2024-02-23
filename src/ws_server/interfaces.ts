import { Ship } from "./classes/ship";
import { User } from "./classes/user";
import { addUserToRoom } from "./responses/add_user_to_room";

export interface updateWinnersInterface {
  name: string;
  wins: number;
}

export interface roomInterface {
  roomId: number;
  roomUsers: userInterface[];
}

export interface userInterface {
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

export interface positionInterface {
  x: number;
  y: number;
}

export interface turnInterface {
  currentPlayer: number /* id of the player in the current game session */;
}

export interface randomAttackInterfaceReq {
  gameId: number;
  indexPlayer: number;
}

export interface attackInterfaceReq {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number /* id of the player in the current game session */;
}

export interface attackInterfaceRes {
  position: positionInterface;
  status: cellStatus;
  currentPlayer: number;
}

export enum cellStatus {
  miss = "miss",
  killed = "killed",
  shot = "shot",
}

export interface finishInterface {
  winPlayer: number;
}
