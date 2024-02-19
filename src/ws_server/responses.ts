import { dir } from "console";
import { Cell } from "./classes/cell.js";
import { Game } from "./classes/game.js";
import { Player } from "./classes/player.js";
import { Room } from "./classes/room.js";
import { Ship, shipType } from "./classes/ship.js";
import { User } from "./classes/user.js";
import { addUserToDB, games, rooms, users } from "./db.js";
import {
  addShipsInterface,
  addUserToRoomInterface,
  attackInterfaceReq,
  attackInterfaceRes,
  cellStatus,
  createGameInterface,
  messageInterface,
  positionInterface,
  regInterfaceReq,
  regInterfaceRes,
  roomInterface,
  startGameInterface,
  turnInterface,
  winnerInterface,
} from "./interfaces.js";
import { messageTypes } from "./message_handler.js";

export function sendResponse(params: {
  ws: WebSocket;
  type: string;
  data: Object;
}) {
  const string: string = JSON.stringify({
    type: params.type,
    data: JSON.stringify(params.data),
    id: 0,
  });
  //  console.log(string);
  params.ws.send(string);
}

export function createGame(params: {
  ws: WebSocket;
  gameId: number;
  idPlayer: number;
}): void {
  games.push(
    new Game({
      gameId: params.gameId,
      players: new Array<Player>(),
      turn: 0,
    })
  );
  const response: createGameInterface = {
    idGame: 0,
    idPlayer: params.idPlayer,
  };

  sendResponse({
    ws: params.ws,
    type: messageTypes.CREATE_GAME,
    data: response,
  });
}

export function addUserToRoom(params: {
  indexRoom: number;
  ws: WebSocket;
  user: User;
}): void {
  rooms[params.indexRoom].roomUsers.push(params.user);
  const response: addUserToRoomInterface = {
    indexRoom: params.indexRoom,
  };

  sendResponse({
    ws: params.ws,
    type: messageTypes.ADD_USER_TO_ROOM,
    data: response,
  });
}

export function register(params: {
  message: messageInterface;
  ws: WebSocket;
}): void {
  const data: regInterfaceReq = JSON.parse(params.message.data);
  const regData: regInterfaceRes = {
    ...data,
    error: false,
    errorText: "error text",
  };
  addUserToDB({
    user: new User({
      name: data.name,
      index: data.index,
      wins: 0,
      ws: params.ws,
    }),
    ws: params.ws,
  });
  sendResponse({ ws: params.ws, type: messageTypes.REG, data: regData });
}

export function createRoom(params: { ws: WebSocket; user: User }): void {
  rooms.push(new Room({ roomUsers: [params.user], roomId: rooms.length }));
  const createRoomData: roomInterface = rooms[
    rooms.length - 1
  ] as roomInterface;
  sendResponse({
    ws: params.ws,
    type: messageTypes.CREATE_ROOM,
    data: createRoomData,
  });
  updateRoomGlobally();
}

export function updateRoomGlobally(): void {
  users.forEach((user) => updateRoom({ ws: user.ws }));
}

export function updateRoom(params: { ws: WebSocket }): void {
  const roomsWithOneUser: Room[] = rooms.filter(
    (room) => room.roomUsers.length == 1
  );
  const response: roomInterface[] = roomsWithOneUser.map(
    (room) => room as roomInterface
  );
  sendResponse({
    ws: params.ws,
    type: messageTypes.UPDATE_ROOM,
    data: response,
  });
}

export function updateWinners(params: { ws: WebSocket }): void {
  const usersSortedByWins: User[] = users.sort((a, b) => a.wins - b.wins);
  const response: winnerInterface[] = usersSortedByWins.map(
    (user) => user as winnerInterface
  );
  sendResponse({
    ws: params.ws,
    type: messageTypes.UPDATE_WINNERS,
    data: response,
  });
}

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

export function startGame(params: { player: Player; game: Game }): void {
  const response: startGameInterface = {
    ships: params.player.ships,
    currentPlayerIndex: params.player.indexPlayer,
  };
  sendResponse({
    ws: params.player.ws,
    type: messageTypes.START_GAME,
    data: response,
  });
  changeTurn({
    ws: params.player.ws,
    gameId: params.game.gameId,
    currentTurn: params.game.turn,
  });
}

export function changeTurn(params: {
  ws: WebSocket;
  gameId: number;
  currentTurn: number;
}): void {
  const changedTurn: number = params.currentTurn === 0 ? 1 : 0;
  const response: turnInterface = {
    currentPlayer: changedTurn,
  };
  sendResponse({
    ws: params.ws,
    type: messageTypes.TURN,
    data: response,
  });
}

export function attack(params: {
  ws: WebSocket;
  message: messageInterface;
}): void {
  const { x, y, gameId }: attackInterfaceReq = JSON.parse(params.message.data);
  const game = games.find((game) => game.gameId === gameId);
  if (!game) throw Error("game not found from attack");
  const turn: number = game.turn;

  const shipWithSuchCell: Ship | undefined = game.players[turn].ships.find(
    (ship) =>
      ship.occupiedCells.find(
        (cell) => cell.position.x === x && cell.position.y === y
      )
  );

  function getCellStatus(): cellStatus {
    if (shipWithSuchCell) {
      const suchCell: Cell = shipWithSuchCell.occupiedCells.find(
        (cell) => cell.position.x === x && cell.position.y === y
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
    const adjacentCells: Cell[] = [];
    const vertical: boolean = shipWithSuchCell!.direction;
    for (let i = 0; i < shipWithSuchCell!.length; i++) {
      const occupiedPosition: positionInterface =
        shipWithSuchCell!.occupiedCells[i].position;

      enum direction {
        up,
        down,
        left,
        right,
      }
      const cellIsfirstShipCell: boolean = i === 0;
      const cellIsLastShipCell: boolean = i === shipWithSuchCell!.length - 1;
      const isSmallShip: boolean = shipWithSuchCell!.type == shipType.small;

      function addAdditionalAdjacentCells(side: direction): void {
        let position: positionInterface = Object.assign({}, occupiedPosition);
        addAdjacentCell({ side: side, position: position });
        switch (side) {
          case direction.up: {
            position.y++;
            fillAjacentCellsArr(position);
            break;
          }
          case direction.down: {
            position.y--;
            fillAjacentCellsArr(position);
            break;
          }
          case direction.left: {
            position.x--;
            fillAjacentCellsArr(position);
            break;
          }
          case direction.right: {
            position.x++;
            fillAjacentCellsArr(position);
            break;
          }
        }
      }

      function addAdjacentCell(params: {
        side: direction;
        position: positionInterface;
      }) {
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
        adjacentCells.push(
          new Cell({
            position: position,
            damaged: false,
          })
        );
      }

      function fillAjacentCellsArr(position: positionInterface): void {
        addAdjacentCell({
          side: vertical ? direction.right : direction.down,
          position: position,
        });
        addAdjacentCell({
          side: vertical ? direction.left : direction.up,
          position: position,
        });
      }

      const beforeFirst: direction = vertical ? direction.down : direction.left;
      const afterLast: direction = vertical ? direction.up : direction.right;

      fillAjacentCellsArr(occupiedPosition);
      if (isSmallShip) {
        addAdditionalAdjacentCells(beforeFirst);
        addAdditionalAdjacentCells(afterLast);
      } else {
        if (cellIsfirstShipCell) {
          addAdditionalAdjacentCells(beforeFirst);
        }
        if (cellIsLastShipCell) {
          addAdditionalAdjacentCells(afterLast);
        }
      }

      const responseOccupied: attackInterfaceRes = {
        status: gotCellStatus,
        position: occupiedPosition,
      };
      sendResponse({
        ws: params.ws,
        type: messageTypes.ATTACK,
        data: responseOccupied,
      });
    }

    for (let i = 0; i < adjacentCells.length; i++) {
      const responseAdjacent: attackInterfaceRes = {
        status: cellStatus.miss,
        position: adjacentCells[i].position,
      };
      sendResponse({
        ws: params.ws,
        type: messageTypes.ATTACK,
        data: responseAdjacent,
      });
    }
  } else {
    const response: attackInterfaceRes = {
      status: gotCellStatus,
      position: {
        x: x,
        y: y,
      },
    };

    sendResponse({ ws: params.ws, type: messageTypes.ATTACK, data: response });
  }
}
