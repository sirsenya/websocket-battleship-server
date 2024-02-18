export class User {
  name: string;
  index: number;
  wins: number;
  ws: WebSocket;

  constructor(params: {
    name: string;
    index: number;
    wins?: number;
    ws: WebSocket;
  }) {
    this.name = params.name;
    this.index = params.index;
    this.wins = params.wins || 0;
    this.ws = params.ws;
  }
}
