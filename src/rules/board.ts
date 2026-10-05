import type { AuthoritativeMatch, Coordinate, Piece } from "../types.ts";

export const DIRECTIONS: readonly Coordinate[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export function inside(
  coordinate: Coordinate,
  width: number,
  height: number,
): boolean {
  return coordinate.x >= 0 && coordinate.x < width &&
    coordinate.y >= 0 && coordinate.y < height;
}

export function pieceAt(
  pieces: readonly Piece[],
  coordinate: Coordinate,
): Piece | undefined {
  return pieces.find(piece => piece.x === coordinate.x && piece.y === coordinate.y);
}

export function sameCoordinate(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

export function orthogonalNeighbors(
  coordinate: Coordinate,
  width: number,
  height: number,
): Coordinate[] {
  return DIRECTIONS
    .map(direction => ({ x: coordinate.x + direction.x, y: coordinate.y + direction.y }))
    .filter(next => inside(next, width, height));
}

export function hasClearRookPath(
  match: AuthoritativeMatch,
  from: Coordinate,
  to: Coordinate,
): boolean {
  if (from.x !== to.x && from.y !== to.y) return false;
  if (sameCoordinate(from, to)) return false;
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let x = from.x + dx;
  let y = from.y + dy;
  while (x !== to.x || y !== to.y) {
    if (pieceAt(match.pieces, { x, y })) return false;
    x += dx;
    y += dy;
  }
  return true;
}

export function movePiece(
  pieces: readonly Piece[],
  moving: Piece,
  destination: Coordinate,
): Piece[] {
  return pieces.map(piece => piece.id === moving.id
    ? { ...piece, x: destination.x, y: destination.y }
    : piece);
}

export function publicPositionKey(match: AuthoritativeMatch): string {
  const occupants = [...match.pieces]
    .map(piece => `${piece.owner}:${piece.x}:${piece.y}`)
    .sort();
  return `${match.mode}|${match.width}x${match.height}|${match.currentPlayer}|${occupants.join(";")}`;
}
