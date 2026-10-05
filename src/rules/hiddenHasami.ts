import type { AuthoritativeMatch, Coordinate, Piece, Player } from "../types.ts";
import { DIRECTIONS, hasClearRookPath, inside, movePiece, pieceAt } from "./board.ts";
import type { ModeRules, MoveResolution, SetupPiece } from "./types.ts";

/** Original hidden-leader adaptation. Traditional Hasami Shogi uses unranked pieces. */
export const HIDDEN_HASAMI_RULES: ModeRules = {
  mode: "hidden-hasami",
  defaultWidth: 9,
  defaultHeight: 9,
  acceptsSize: (width, height) =>
    (width === 7 && height === 7) || (width === 9 && height === 9),
  roster: (_player, width) => ["leader", ...Array(width - 1).fill("guard")],
  validateSetup,
  legalDestinations,
  resolveMove,
};

function validateSetup(
  player: Player,
  placements: readonly SetupPiece[],
): boolean {
  const side = placements.length === 7 ? 7 : placements.length === 9 ? 9 : 0;
  if (!side || placements.length !== side) return false;
  const homeY = player === 0 ? side - 1 : 0;
  const leaderCount = placements.filter(piece => piece.kind === "leader").length;
  const guards = placements.filter(piece => piece.kind === "guard").length;
  const occupied = new Set<string>();
  for (const piece of placements) {
    if (piece.y !== homeY || !Number.isInteger(piece.x) || piece.x < 0 || piece.x >= side) return false;
    const key = `${piece.x}:${piece.y}`;
    if (occupied.has(key)) return false;
    occupied.add(key);
  }
  return leaderCount === 1 && guards === side - 1;
}

function legalDestinations(
  match: AuthoritativeMatch,
  piece: Piece,
): Coordinate[] {
  const destinations: Coordinate[] = [];
  for (const direction of DIRECTIONS) {
    let next = { x: piece.x + direction.x, y: piece.y + direction.y };
    while (inside(next, match.width, match.height) && !pieceAt(match.pieces, next)) {
      destinations.push(next);
      next = { x: next.x + direction.x, y: next.y + direction.y };
    }
  }
  return destinations;
}

function resolveMove(
  match: AuthoritativeMatch,
  moving: Piece,
  destination: Coordinate,
): MoveResolution {
  if (!hasClearRookPath(match, moving, destination) || pieceAt(match.pieces, destination)) {
    throw new RangeError("Hasami stones move along a clear rank or file to an empty cell");
  }

  const moved = { ...moving, x: destination.x, y: destination.y };
  let pieces = movePiece(match.pieces, moving, destination);
  const captured = new Map<string, Piece>();

  for (const direction of DIRECTIONS) {
    let x = destination.x + direction.x;
    let y = destination.y + direction.y;
    const run: Piece[] = [];
    while (inside({ x, y }, match.width, match.height)) {
      const piece = pieceAt(pieces, { x, y });
      if (!piece) break;
      if (piece.owner === moving.owner) {
        run.forEach(enemy => captured.set(enemy.id, enemy));
        break;
      }
      run.push(piece);
      x += direction.x;
      y += direction.y;
    }
  }

  const removed = [...captured.values()];
  if (removed.length) {
    const removedIds = new Set(removed.map(piece => piece.id));
    pieces = pieces.filter(piece => !removedIds.has(piece.id));
  }

  const enemy = (1 - moving.owner) as Player;
  const leaderTaken = removed.some(piece => piece.owner === enemy && piece.kind === "leader");
  const enemyCount = pieces.filter(piece => piece.owner === enemy).length;
  if (leaderTaken) {
    return { pieces, captured: removed, movedPiece: moved, winner: moving.owner, reason: "objective-captured" };
  }
  if (enemyCount <= 1) {
    return { pieces, captured: removed, movedPiece: moved, winner: moving.owner, reason: "capture-threshold" };
  }
  return { pieces, captured: removed, movedPiece: moved };
}
