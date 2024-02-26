1. run npm i
2. run npm start
3. open two browser windows and go to "http://localhost:8181/" on each. Do the following in both windows;
4. Login/registration:
   a. type username and password (both should be 5 symbols or more). New user will be added to the db and become logged in (online);
   b. if there is already a user with this username in the db and:
   - that user is logged in: error message will appear;
   - that user is not logged in and password is incorrect - error message will appear;
   - that user is not logged in, the user won't be added to the db, but will become logged in.
     c. if user closes its browser window, he remains in db, but becomes offline.
5. A User can create only 1 room. The user is automatically added to his room. If the after room creation the user joins other room, creates single game or disconnects, his room becomes closed. User can't join his own room.
6. After joining someone's room both players are asked to place their ships.
7. After placing the ships the game begins. Player on his turn can attack only those enemy cells that are not shot yet. If he damages/kills the enemy ship he should attack again. To perform a random attack wait 15 secs on the beginning of your turn.
8. If all the enemy ships are destroyed, the winner appears on the winner table of the main menu. Also if some player disconnects from server during the game he is considered to be looser.
9. Single game: user plays with a smart bot. The user goes first. If the user misses, the bot goes. For the sake of time economy the bot goes immediately, so it can seem that the bot destroys several cells at the same time. However the bot goes only one cell at the time on its turn. First bot shoots a random position. If it damages a ship of the player, the bot priorities the ending cells of the supposed ship, calculating whether the ship is positioned vertically or horizontally. The bot plays completely fair, good luck!
