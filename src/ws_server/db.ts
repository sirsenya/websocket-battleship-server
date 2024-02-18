import { Game } from "./classes/game.js";
import { Room } from "./classes/room.js";
import { User } from "./classes/user.js";
import { updateRoom } from "./responses.js";

export const games: Game[] = [];
export const users: User[] = [];
export const rooms: Room[] = [];

export function addUserToDB(params: { user: User; ws: WebSocket }) {
  users.push(params.user);
  updateRoom({ ws: params.ws });
}
