import { Player } from "../classes/player.js";
import { games } from "../db.js";
import { positionInterface, randomAttackInterfaceReq } from "../interfaces.js";
import { attack } from "./attack.js";

export function randomAttack(params: randomAttackInterfaceReq): void {
  const game = games.find((game) => game.gameId === params.gameId);
  if (!game) throw Error("game not found from attack");

  const attacker: Player = game.players.find(
    (player) => player.indexPlayer === params.indexPlayer
  )!;

  const allShotsMade: positionInterface[] = Array.from<string>(
    attacker.shotCells.keys()
  )
    .filter((shot) => !shot.includes("-"))
    .map((string) => ({
      x: Number(string.charAt(0)),
      y: Number(string.charAt(1)),
    }));

  const randoPosition = generateRandomPosition({
    excludedPositions: allShotsMade,
  });

  attack({ x: randoPosition.x, y: randoPosition.y, ...params });
}

export function generateRandomPosition(params: {
  excludedPositions: positionInterface[];
}): positionInterface {
  const cellsInRow: number = 10;
  let x: number = Math.floor(Math.random());
  let y: number = 0;

  function validateX() {
    const ysShotOnThisX: number[] = params.excludedPositions
      .filter((shotPosition) => shotPosition.x === x)
      .map((shotPosition) => shotPosition.y);
    const lineIsShot: boolean = ysShotOnThisX.length === cellsInRow;

    if (lineIsShot) {
      x === cellsInRow - 1 ? (x = 0) : x++;
      validateX();
    } else {
      const unshotYs: number[] = [];
      for (let i = 0; i < cellsInRow; i++) {
        if (!ysShotOnThisX.includes(i)) unshotYs.push(i);
      }
      const index: number = Math.floor(Math.random() * unshotYs.length);
      y = unshotYs[index];
    }
  }
  validateX();
  return { x, y };
}
