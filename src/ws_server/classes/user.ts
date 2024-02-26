export class User {
  name: string;
  index: number;
  wins: number;
  password: string;
  ws: WebSocket;
  online: boolean;

  constructor(params: {
    name: string;
    index: number;
    wins?: number;
    password: string;
    ws: WebSocket;
    online: boolean;
  }) {
    this.name = params.name;
    this.index = params.index;
    this.wins = params.wins || 0;
    this.ws = params.ws;
    this.password = params.password;
    this.online = params.online;
  }
}
