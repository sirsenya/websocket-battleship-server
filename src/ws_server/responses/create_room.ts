import { Room } from "../classes/room.js";
import { User } from "../classes/user.js";
import { rooms } from "../db.js";
import { updateRoomGlobally } from "./update_room.js";

export function createRoom(params: { ws: WebSocket; user: User }): void {
  rooms.push(new Room({ roomUsers: [params.user], roomId: rooms.length }));
  updateRoomGlobally();
}
