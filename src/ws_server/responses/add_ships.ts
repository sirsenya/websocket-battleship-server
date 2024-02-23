import { Player } from "../classes/player.js";
import { Ship, getOccupiedCells, shipType } from "../classes/ship.js";
import { games, users } from "../db.js";
import { positionInterface } from "../interfaces.js";
import { positionToString } from "./attack.js";
import { getAdjacentCells } from "./get_adjacent_cells.js";
import { generateRandomPosition, stringsToPositions } from "./random_attack.js";
import { startGame } from "./start_game.js";

export function addShips(params: {
  indexPlayer: number;
  ws: WebSocket;
  gameId: number;
  ships: Ship[];
}): void {
  const player = new Player({
    indexPlayer: params.indexPlayer,
    ships: params.ships.map((ship) => new Ship({ ...ship })), // addRandomShips(),
    gameId: params.gameId,
    ws: params.ws,
  });
  const game = games[params.gameId];
  const players: Player[] = game.players;
  players.push(player);
  if (players.length === 2) {
    const turn: number = users[0].index;
    game.turn = turn;
    players.forEach((player) => startGame({ player: player, game: game }));
  }
}

export function addRandomShips(): Ship[] {
  function getLShipLength(type: shipType): number {
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
  const availableShips: shipType[] = new Array(10)
    .fill(shipType.huge, 0, 1)
    .fill(shipType.large, 1, 3)
    .fill(shipType.medium, 3, 6)
    .fill(shipType.small, 6, 10);

  const randomShips: Ship[] = [];

  const occupiedPositions: positionInterface[] = [];
  const adjacentPositions: positionInterface[] = [];

  for (let i = 0; i < availableShips.length; i++) {
    const type: shipType = availableShips[i];
    const vertical: boolean = Math.floor(Math.random() * 10) > 4 ? true : false;

    const length: number = getLShipLength(type);
    const cellsInRow = 10;

    function getUnfitSizePositions(): positionInterface[] {
      const unfitSizePositions: positionInterface[] = [];

      for (let i = cellsInRow; i > cellsInRow - length + 1; i--) {
        for (let j = 0; j < cellsInRow; j++) {
          unfitSizePositions.push({
            y: vertical ? i : j,
            x: vertical ? j : i,
          });
        }
      }
      return unfitSizePositions;
    }
    const unfitSizePositions: positionInterface[] = getUnfitSizePositions();

    // console.log(
    //   `unfitSizePositions ${
    //     unfitSizePositions.map((position) => positionToString(position)).length
    //   }`
    // );
    // console.log(
    //   `occupiedPositions ${
    //     occupiedPositions.map((position) => positionToString(position)).length
    //   }`
    // );
    // console.log(
    //   `adjacentPositions ${
    //     adjacentPositions.map((position) => positionToString(position)).length
    //   }`
    // );

    const excludedPositionsStrings: string[] = [
      ...unfitSizePositions,
      ...occupiedPositions,
      ...adjacentPositions,
    ].map((position) => positionToString(position));
    // console.log(`excluded: ${excludedPositionsStrings}`);

    const uniqueExcludedPositionsString: string[] = Array.from(
      new Set(excludedPositionsStrings).keys()
    );
    const uniqueExcludedPositions: positionInterface[] = stringsToPositions(
      uniqueExcludedPositionsString
    );

    function validateRandomPosition(params: {
      hash: positionInterface[];
    }): positionInterface {
      const hash: positionInterface[] = params.hash;

      const position: positionInterface = generateRandomPosition({
        excludedPositions: [...uniqueExcludedPositions, ...hash],
      });

      const occupiedPositions: string[] = getOccupiedCells({
        position: position,
        direction: vertical,
        length: length,
      }).map((cell) => positionToString(cell.position));

      for (let i = 0; i < occupiedPositions.length; i++) {
        // console.log(`occupiedPositions.length = ${occupiedPositions.length}`);
        if (uniqueExcludedPositionsString.includes(occupiedPositions[i])) {
          hash.push(position);
          return validateRandomPosition({ hash: hash });
        }
      }
      return position;
    }

    const position: positionInterface = validateRandomPosition({
      hash: [],
    });

    const ship: Ship = new Ship({
      direction: vertical,
      type: type,
      length: length,
      position: position,
    });

    randomShips.push(ship);
    occupiedPositions.push(
      ...getOccupiedCells({
        position: position,
        direction: vertical,
        length: length,
      }).map((cell) => cell.position)
    );
    adjacentPositions.push(
      ...getAdjacentCells({
        ship: ship,
      }).map((cell) => cell.position)
    );
  }
  return randomShips;
}
