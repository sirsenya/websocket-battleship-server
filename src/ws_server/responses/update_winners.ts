import { User } from "../classes/user.js";
import { users } from "../db.js";
import { winnerInterface } from "../interfaces.js";
import { messageTypes } from "../message_handler.js";
import { sendResponse } from "./send_response.js";

export function updateWinners(): void {
  const usersSortedByWins: User[] = users.sort((a, b) => b.wins - a.wins);
  const response: winnerInterface[] = usersSortedByWins.map(
    (user) => user as winnerInterface
  );
  users.forEach((user) =>
    sendResponse({
      ws: user.ws,
      type: messageTypes.UPDATE_WINNERS,
      data: response,
    })
  );
}
