import { User } from "../classes/user.js";
import { users } from "../db.js";
import { winnerInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";

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
