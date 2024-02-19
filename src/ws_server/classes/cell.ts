import { cellStatus, positionInterface } from "../interfaces";

export class Cell {
  position: positionInterface;
  damaged: boolean;

  constructor(params: { position: positionInterface; damaged: boolean }) {
    this.position = params.position;
    this.damaged = params.damaged;
  }
}
