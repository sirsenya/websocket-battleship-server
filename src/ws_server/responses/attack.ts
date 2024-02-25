import { Cell } from "../classes/cell.js";
import { Player } from "../classes/player.js";
import { Ship } from "../classes/ship.js";
import { games, users } from "../db.js";
import {
  attackInterfaceReq,
  cellStatus,
  positionInterface,
  attackInterfaceRes,
  finishInterface,
} from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { getAdjacentCells } from "./get_adjacent_cells.js";
import { randomAttack, stringsToPositions } from "./random_attack.js";
import { sendResponse } from "./send_response.js";
import { setTurn } from "./turn.js";
import { updateWinners } from "./update_winners.js";

export function positionToString(position: positionInterface): string {
  return `${position.x}${position.y}`;
}

export function attack(params: attackInterfaceReq): void {
  const game = games.find((game) => game?.gameId === params.gameId);
  if (!game) throw Error("game not found from attack");
  const enemy: Player = game.players.find(
    (player) => player?.indexPlayer !== params.indexPlayer
  )!;
  const attacker: Player = game.players.find(
    (player) => player?.indexPlayer === params.indexPlayer
  )!;

  if (
    game.turn !== params.indexPlayer ||
    Array.from(attacker.shotCells.keys()).find(
      (key) =>
        key.includes(`${params.x}${params.y}`) || allEnemyShipsDestroyed(enemy)
    )
  ) {
    return;
  }

  const shipWithSuchCell: Ship | undefined = enemy.ships.find((ship) =>
    ship.occupiedCells.find(
      (cell) => cell.position.x === params.x && cell.position.y === params.y
    )
  );

  function allEnemyShipsDestroyed(enemy: Player): boolean {
    function shipIsDestroyed(ship: Ship): boolean {
      for (let i = 0; i < ship.length; i++) {
        if (!ship.occupiedCells[i].damaged) {
          return false;
        }
      }
      return true;
    }
    for (let i = 0; i < enemy.ships.length; i++) {
      if (!shipIsDestroyed(enemy.ships[i])) {
        return false;
      }
    }
    return true;
  }

  function sendToPlayers(params: { data: object; type: messageTypes }) {
    game?.players.forEach((player) =>
      sendResponse({
        ws: player.ws,
        type: params.type,
        data: params.data,
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
      sendToPlayers({ data: responseOccupied, type: messageTypes.ATTACK });
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
      sendToPlayers({ data: responseAdjacent, type: messageTypes.ATTACK });
      attacker.shotCells.set(positionToString(position), status);
    }

    ////SEND FINISH
    if (allEnemyShipsDestroyed(enemy)) {
      const data: finishInterface = {
        winPlayer: attacker.indexPlayer,
      };
      //if not a bot
      if (attacker.indexPlayer >= 0) {
        users.find((user) => user.index === attacker.indexPlayer)!.wins++;
      }
      sendToPlayers({ type: messageTypes.FINISH, data: data });
      updateWinners();
      return;
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

    sendToPlayers({ data: response, type: messageTypes.ATTACK });
    attacker.shotCells.set(positionToString(position), gotCellStatus);

    for (let i = 0; i < enemy.ships.length; i++) {
      if (enemy.ships[i].occupiedCells) {
      }
    }

    if (gotCellStatus === cellStatus.miss) {
      game.players.forEach((player) =>
        setTurn({
          ws: player.ws,
          gameId: game.gameId,
          turn: enemy.indexPlayer,
        })
      );
    }
  }
  ///if bot
  if (game.turn < 0 && !allEnemyShipsDestroyed(enemy)) {
    randomAttack({ gameId: game.gameId, indexPlayer: game.turn });
  }
}
