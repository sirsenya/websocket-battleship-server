export class Attack {
  y: number;
  x: number;
  cellStatus: cellStatus;

  constructor(x: number, y: number, status: cellStatus) {
    this.x = x;
    this.y = y;
    this.cellStatus = status;
  }
}

// export const users: Attack[] = [];

enum cellStatus {
  occupied,
  free,
  invisible,
}
