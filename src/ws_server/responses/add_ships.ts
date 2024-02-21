import { Player } from "../classes/player.js";
import { Ship, shipType } from "../classes/ship.js";
import { games } from "../db.js";
import {
  messageInterface,
  addShipsInterface,
  positionInterface,
} from "../interfaces.js";
import { generateRandomPosition } from "./random_attack.js";
import { startGame } from "./start_game.js";

export function addShips(params: {
  message: messageInterface;
  ws: WebSocket;
  gameId: number;
}): void {
  const { gameId, ships, indexPlayer }: addShipsInterface = JSON.parse(
    params.message.data
  );
  const player = new Player({
    indexPlayer: indexPlayer,
    ships: ships.map((ship) => new Ship({ ...ship })),
    gameId: gameId,
    ws: params.ws,
  });
  games[params.gameId].players.push(player);
  if (games[params.gameId].players.length === 2) {
    games[params.gameId].players.forEach((player) =>
      startGame({ player: player, game: games[params.gameId] })
    );
  }
}

export function addRandomShips() {
  //
  const randomShips: Ship[] = [];
  const availableShips: shipType[] = new Array(10)
    .fill(shipType.huge, 0, 1)
    .fill(shipType.large, 1, 3)
    .fill(shipType.medium, 3, 6)
    .fill(shipType.small, 6, 10);

  // const availableCells: positionInterface[] = [];

  // for (let x = 0; x < 10; x++) {
  //   for (let y = 0; y < 10; y++) {
  //     availableCells.push({ x, y });
  //   }
  // }
  const occupiedPositions: positionInterface[] = [];

  for (let i = 0; i < availableShips.length; i++) {
    const type: shipType = availableShips[i];
    const position: positionInterface = { x: 0, y: 0 };
    const direction: boolean =
      Math.floor(Math.random() * 10) > 4 ? true : false;
    function getLength(): number {
      switch (type) {
        case shipType.huge:
          return 4;
        case shipType.large:
          return 3;
        case shipType.medium:
          return 2;
        case shipType.small:
          return 1;
      }
    }
    const length: number = getLength();
    const cellsInRow = 10;

    function getExcludedPositions(): positionInterface[] {
      const excludedPositions: positionInterface[] = [];

      for (let i = 0; i < cellsInRow - length; i++) {
        for (let j = 0; j < cellsInRow; j++) {
          excludedPositions.push({
            x: direction ? j : i,
            y: direction ? i : j,
          });
        }
      }
      return excludedPositions;
    }

    generateRandomPosition({ excludedPositions: getExcludedPositions() });

    randomShips.push(
      new Ship({
        direction: direction,
        type: type,
        length: length,
        position: position,
      })
    );
  }

  console.log(availableShips);
}
