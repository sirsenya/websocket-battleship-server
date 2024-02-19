import { positionInterface } from "../interfaces";
import { Cell } from "./cell.js";

export class Ship {
  position: positionInterface;
  direction: boolean;
  length: number;
  type: shipType;
  occupiedCells: Cell[];

  constructor(params: {
    position: positionInterface;
    direction: boolean;
    length: number;
    type: shipType;
  }) {
    this.position = params.position;
    this.direction = params.direction;
    this.length = params.length;
    this.type = params.type;
    this.occupiedCells = occupiedCells(params);
  }
}

export enum shipType {
  small = "small",
  medium = "medium",
  large = "large",
  huge = "huge",
}

function occupiedCells(params: {
  position: positionInterface;
  direction: boolean;
  length: number;
}): Cell[] {
  const occupiedCells: Cell[] = [
    new Cell({ position: params.position, damaged: false }),
  ];
  for (let i = 1; i < params.length; i++) {
    occupiedCells.push(
      new Cell({
        position: {
          x: params.direction ? params.position.x : params.position.x + i,
          y: params.direction ? params.position.y + i : params.position.y,
        },
        damaged: false,
      })
    );
  }
  return occupiedCells;
}
