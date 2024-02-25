import { Player } from "../classes/player.js";
import { games } from "../db.js";
import {
  cellStatus,
  positionInterface,
  randomAttackInterfaceReq,
} from "../interfaces.js";
import { attack, positionToString } from "./attack.js";

export function stringsToPositions(strings: string[]): positionInterface[] {
  return strings
    .filter((string) => !string.includes("-"))
    .map((string) => ({
      x: Number(string.charAt(0)),
      y: Number(string.charAt(1)),
    }));
}

export function randomAttack(params: randomAttackInterfaceReq): void {
  const game = games.find((game) => game?.gameId === params.gameId);
  if (!game) throw Error("game not found from attack");

  const attacker: Player = game.players.find(
    (player) => player.indexPlayer === params.indexPlayer
  )!;

  const allShotsMade: positionInterface[] = stringsToPositions(
    Array.from<string>(attacker.shotCells.keys())
  );

  const enemyDamagedPositions: positionInterface[] = stringsToPositions(
    Array.from<string>(attacker.shotCells.keys()).filter(
      (key) => attacker.shotCells.get(key) === cellStatus.shot
    )
  );

  function getAdjacentShotPositions(
    edp: positionInterface[]
  ): positionInterface[] {
    let result: positionInterface[] = [];
    const eDP = Array.from<positionInterface>(edp);
    const lastElement = eDP.pop();
    if (lastElement) {
      function findAdjacentShot(shot: positionInterface): positionInterface[] {
        const foundAdjacentShots: positionInterface[] = eDP.filter(
          (position) =>
            (position.x === shot.x &&
              (position.y === shot.y + 1 || position.y === shot.y - 1)) ||
            (position.y === shot.y &&
              (position.x === shot.x + 1 || position.x === shot.x - 1))
        );
        if (foundAdjacentShots.length > 0) {
          if (foundAdjacentShots.length > 1) {
            return [...foundAdjacentShots, shot];
          }
          delete eDP[eDP.indexOf(foundAdjacentShots[0])];
          return [
            shot,
            ...foundAdjacentShots,
            ...findAdjacentShot(foundAdjacentShots[0]),
          ];
        }
        const lE = eDP.pop();
        if (lE) {
          return findAdjacentShot(lE);
        } else {
          return [];
        }
      }
      result = findAdjacentShot(lastElement);
    } else {
      result = [];
    }

    const set = new Set(result.map((position) => positionToString(position)));

    return stringsToPositions(Array.from(set));
  }

  let positionsFarFromDamaged: positionInterface[] = [];

  if (enemyDamagedPositions.length > 0) {
    const adjacentShotPositions = getAdjacentShotPositions(
      enemyDamagedPositions
    );
    if (adjacentShotPositions.length > 1) {
      const isVertical: boolean =
        adjacentShotPositions[0].x === adjacentShotPositions[1].x;
      adjacentShotPositions.sort((a, b) =>
        isVertical ? a.y - b.y : a.x - b.x
      );
      const availableCells: positionInterface[] = [
        {
          x: isVertical
            ? adjacentShotPositions[0].x
            : adjacentShotPositions[0].x - 1,
          y: isVertical
            ? adjacentShotPositions[0].y - 1
            : adjacentShotPositions[0].y,
        },
        {
          x: isVertical
            ? adjacentShotPositions[adjacentShotPositions.length - 1].x
            : adjacentShotPositions[adjacentShotPositions.length - 1].x + 1,
          y: isVertical
            ? adjacentShotPositions[adjacentShotPositions.length - 1].y + 1
            : adjacentShotPositions[adjacentShotPositions.length - 1].y,
        },
      ];
      const availableCellsStrings: string[] = availableCells.map((position) =>
        positionToString(position)
      );
      const validatedAvailableCells: positionInterface[] = stringsToPositions(
        availableCellsStrings
      );
      positionsFarFromDamaged = [];
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          if (
            !validatedAvailableCells.find(
              (position) => position.x === x && position.y === y
            )
          ) {
            positionsFarFromDamaged.push({ x, y });
          }
        }
      }
    } else {
      const pos = enemyDamagedPositions[0];
      const availableCells: positionInterface[] = [
        { x: pos.x, y: pos.y - 1 },
        { x: pos.x, y: pos.y + 1 },
        { x: pos.x - 1, y: pos.y },
        { x: pos.x + 1, y: pos.y },
      ];
      const availableCellsStrings: string[] = availableCells.map((position) =>
        positionToString(position)
      );
      const validatedAvailableCells: positionInterface[] = stringsToPositions(
        availableCellsStrings
      );
      positionsFarFromDamaged = [];
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          if (
            !validatedAvailableCells.find(
              (position) => position.x === x && position.y === y
            )
          ) {
            positionsFarFromDamaged.push({ x, y });
          }
        }
      }
    }
  }

  const set = new Set([
    ...allShotsMade.map((position) => positionToString(position)),
    ...positionsFarFromDamaged.map((position) => positionToString(position)),
  ]);

  const randomPosition = generateRandomPosition({
    excludedPositions: stringsToPositions(Array.from(set)),
  });

  attack({ x: randomPosition.x, y: randomPosition.y, ...params });
}

export function generateRandomPosition(params: {
  excludedPositions: positionInterface[];
}): positionInterface {
  const cellsInRow: number = 10;

  let x: number = Math.floor(Math.random() * cellsInRow);
  let y: number = 0;

  function validateX() {
    const ysShotOnThisX: number[] = params.excludedPositions
      .filter((shotPosition) => shotPosition.x === x)
      .map((shotPosition) => shotPosition.y);

    const lineIsShot: boolean = ysShotOnThisX.length === cellsInRow;

    if (lineIsShot) {
      x >= cellsInRow - 1 ? (x = 0) : x++;
      validateX();
    } else {
      const unshotYs: number[] = [];
      for (let i = 0; i < cellsInRow; i++) {
        if (!ysShotOnThisX.includes(i)) {
          unshotYs.push(i);
        }
      }
      const index: number = Math.floor(Math.random() * unshotYs.length);

      y = unshotYs[index];
    }
  }
  validateX();
  return { x, y };
}
