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
  const game = games.find((game) => game.gameId === params.gameId);
  if (!game) throw Error("game not found from attack");

  const attacker: Player = game.players.find(
    (player) => player.indexPlayer === params.indexPlayer
  )!;

  const allShotsMade: positionInterface[] = stringsToPositions(
    Array.from<string>(attacker.shotCells.keys())
  );

  const enemyDamagedPositions: positionInterface[] = stringsToPositions(
    Array.from<string>(attacker.shotCells.keys())
  );

  const totalCellNumber: number = 100;

  if (enemyDamagedPositions.length > 0) {
    const positionsFarFromTheDamaged: string[] = [];

    if (enemyDamagedPositions.length < 2) {
      const position = enemyDamagedPositions[0];

      const targetPositions: string[] = [
        { x: position.x, y: position.y + 1 },
        { x: position.x, y: position.y - 1 },
        { x: position.x + 1, y: position.y },
        { x: position.x - 1, y: position.y },
      ].map((position) => positionToString(position));

      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const stringPosition = positionToString({ x, y });
          if (!targetPositions.find((string) => string === stringPosition)) {
            positionsFarFromTheDamaged.push(stringPosition);
          }
        }
      }
    } else {
    }
  }

  const randomPosition = generateRandomPosition({
    excludedPositions: allShotsMade,
  });

  attack({ x: randomPosition.x, y: randomPosition.y, ...params });
  // console.log(`attacker shots: ${attacker.shotCells}`);
}

export function generateRandomPosition(params: {
  excludedPositions: positionInterface[];
}): positionInterface {
  // console.log(params.excludedPositions);
  const cellsInRow: number = 10;

  let x: number = Math.floor(Math.random() * cellsInRow);
  //  console.log(`first x: ${x}`);
  let y: number = 0;

  function validateX() {
    const ysShotOnThisX: number[] = params.excludedPositions
      .filter((shotPosition) => shotPosition.x === x)
      .map((shotPosition) => shotPosition.y);

    // console.log(`YS shot on this x: ${ysShotOnThisX}`);
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
      // console.log(`index: ${index}`);
      //  console.log(`unshotYs: ${unshotYs}`);

      y = unshotYs[index];
      //  console.log(`y: ${y}`);
    }
  }
  validateX();
  // console.log(`result: ${x}${y}`);
  return { x, y };
}
