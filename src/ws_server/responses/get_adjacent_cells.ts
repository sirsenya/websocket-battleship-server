import { Cell } from "../classes/cell.js";
import { Ship } from "../classes/ship.js";
import { positionInterface } from "../interfaces.js";

export function getAdjacentCells(params: { ship: Ship }): Cell[] {
  const vertical = params.ship.direction;
  const adjacentCells: Cell[] = [];
  function calculatePositionOfAdjacentCell(params: {
    side: direction;
    position: positionInterface;
  }): positionInterface {
    let position: positionInterface = Object.assign({}, params.position);
    switch (params.side) {
      case direction.up: {
        position.y++;
        break;
      }
      case direction.down: {
        position.y--;
        break;
      }
      case direction.left: {
        position.x--;
        break;
      }
      case direction.right: {
        position.x++;
        break;
      }
    }
    return position;
  }

  function addAdjacentCell(params: {
    side: direction;
    position: positionInterface;
  }) {
    const position = calculatePositionOfAdjacentCell(params);

    function validatPosition(position: positionInterface): boolean {
      return !(
        position.x < 0 ||
        position.x > 9 ||
        position.y < 0 ||
        position.y > 9
      );
    }

    if (validatPosition(position)) {
      adjacentCells.push(
        new Cell({
          position: position,
          damaged: false,
        })
      );
    }
  }

  function fillAdjacentCellsArr(position: positionInterface): void {
    addAdjacentCell({
      side: vertical ? direction.right : direction.down,
      position: position,
    });
    addAdjacentCell({
      side: vertical ? direction.left : direction.up,
      position: position,
    });
  }

  function addAdditionalAdjacentCells(data: {
    side: direction;
    occupiedPosition: positionInterface;
  }): void {
    let position: positionInterface = Object.assign({}, data.occupiedPosition);
    addAdjacentCell({ side: data.side, position: position });
    fillAdjacentCellsArr(
      calculatePositionOfAdjacentCell({ side: data.side, position: position })
    );
  }
  const beforeFirst: direction = vertical ? direction.down : direction.left;
  const afterLast: direction = vertical ? direction.up : direction.right;

  for (let i = 0; i < params.ship.length; i++) {
    const cellIsfirstShipCell: boolean = i === 0;
    const cellIsLastShipCell: boolean = i === params.ship.length - 1;
    const occupiedPosition: positionInterface =
      params.ship.occupiedCells[i].position;

    fillAdjacentCellsArr(occupiedPosition);
    if (cellIsfirstShipCell) {
      addAdditionalAdjacentCells({
        side: beforeFirst,
        occupiedPosition: occupiedPosition,
      });
    }
    if (cellIsLastShipCell) {
      addAdditionalAdjacentCells({
        side: afterLast,
        occupiedPosition: occupiedPosition,
      });
    }
  }
  return adjacentCells;
}

export enum direction {
  up,
  down,
  left,
  right,
}
