import { Cell } from "../classes/cell.js";
import { Player } from "../classes/player.js";
import { Ship, shipType } from "../classes/ship.js";
import { games } from "../db.js";
import {
  attackInterfaceReq,
  cellStatus,
  positionInterface,
  attackInterfaceRes,
} from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";
import { setTurn } from "./turn.js";

export function positionToString(position: positionInterface): string {
  return `${position.x}${position.y}`;
}

export function attack(params: attackInterfaceReq): void {
  const game = games.find((game) => game.gameId === params.gameId);
  if (!game) throw Error("game not found from attack");
  if (game.turn !== params.indexPlayer) {
    return;
  }

  const enemy: Player = game.players.find(
    (player) => player.indexPlayer !== params.indexPlayer
  )!;
  const attacker: Player = game.players.find(
    (player) => player.indexPlayer === params.indexPlayer
  )!;

  const shipWithSuchCell: Ship | undefined = enemy.ships.find((ship) =>
    ship.occupiedCells.find(
      (cell) => cell.position.x === params.x && cell.position.y === params.y
    )
  );

  function sendToPlayers(data: attackInterfaceRes) {
    game?.players.forEach((player) =>
      sendResponse({
        ws: player.ws,
        type: messageTypes.ATTACK,
        data: data,
      })
    );
  }

  function getCellStatus(): cellStatus {
    if (shipWithSuchCell) {
      const suchCell: Cell = shipWithSuchCell.occupiedCells.find(
        (cell) => cell.position.x === params.x && cell.position.y === params.y
      )!;
      suchCell.damaged = true;
      return shipWithSuchCell.occupiedCells.every((cell) => cell.damaged)
        ? cellStatus.killed
        : cellStatus.shot;
    } else {
      return cellStatus.miss;
    }
  }
  const gotCellStatus: cellStatus = getCellStatus();

  if (gotCellStatus === cellStatus.killed) {
    const vertical: boolean = shipWithSuchCell!.direction;

    for (let i = 0; i < shipWithSuchCell!.length; i++) {
      const occupiedPosition: positionInterface =
        shipWithSuchCell!.occupiedCells[i].position;
      const responseOccupied: attackInterfaceRes = {
        status: gotCellStatus,
        position: occupiedPosition,
        currentPlayer: attacker.indexPlayer,
      };
      sendToPlayers(responseOccupied);
      attacker.shotCells.set(positionToString(occupiedPosition), gotCellStatus);
    }

    const adjacentCells: Cell[] = getAdjacentCells({
      ship: shipWithSuchCell!,
    });

    for (let i = 0; i < adjacentCells.length; i++) {
      const position: positionInterface = adjacentCells[i].position;
      const status: cellStatus = cellStatus.miss;
      const responseAdjacent: attackInterfaceRes = {
        status: status,
        position: position,
        currentPlayer: attacker.indexPlayer,
      };
      sendToPlayers(responseAdjacent);
      attacker.shotCells.set(positionToString(position), status);
      //console.log(attacker.shotCells.entries());
    }
  } else {
    const position: positionInterface = {
      x: params.x,
      y: params.y,
    };
    const response: attackInterfaceRes = {
      status: gotCellStatus,
      position: position,
      currentPlayer: attacker.indexPlayer,
    };

    sendToPlayers(response);
    attacker.shotCells.set(positionToString(position), gotCellStatus);
    //console.log(attacker.shotCells.entries());

    if (gotCellStatus === cellStatus.miss) {
      const changedTurn = game.turn === 0 ? 1 : 0;
      game.players.forEach((player) =>
        setTurn({
          ws: player.ws,
          gameId: game.gameId,
          turn: changedTurn,
        })
      );
    }
  }
}

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
