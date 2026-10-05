import type { AuthoritativeMatch, Coordinate, Piece, Player } from "../types.ts";
import { movePiece, pieceAt } from "./board.ts";
import type { ModeRules, MoveResolution, SetupPiece } from "./types.ts";

const ROSTER = [
  "marshal", "general", "colonel", "colonel", "major", "major", "major",
  ...Array(4).fill("captain"), ...Array(4).fill("lieutenant"),
  ...Array(4).fill("sergeant"), ...Array(5).fill("miner"),
  ...Array(8).fill("scout"), "spy", ...Array(6).fill("bomb"), "flag",
];
const RANK = new Map([
  ["marshal", 10], ["general", 9], ["colonel", 8], ["major", 7],
  ["captain", 6], ["lieutenant", 5], ["sergeant", 4], ["miner", 3],
  ["scout", 2], ["spy", 1],
]);
const LAKES = new Set([
  "2:4", "3:4", "6:4", "7:4", "2:5", "3:5", "6:5", "7:5",
]);

/** Original streamlined capture-flag rules using the published Original roster and combat table. */
export const STRATEGO_LITE_RULES: ModeRules = {
  mode: "stratego-lite",
  defaultWidth: 10,
  defaultHeight: 10,
  acceptsSize: (width, height) => width === 10 && height === 10,
  roster: () => ROSTER,
  validateSetup,
  legalDestinations,
  resolveMove,
};

function validateSetup(player: Player, placements: readonly SetupPiece[]): boolean {
  if (placements.length !== ROSTER.length) return false;
  const rows = player === 0 ? [6, 7, 8, 9] : [0, 1, 2, 3];
  const occupied = new Set<string>();
  const counts = new Map<string, number>();
  for (const piece of placements) {
    if (!Number.isInteger(piece.x) || piece.x < 0 || piece.x > 9 || !rows.includes(piece.y)) return false;
    const key = `${piece.x}:${piece.y}`;
    if (occupied.has(key)) return false;
    occupied.add(key);
    counts.set(piece.kind, (counts.get(piece.kind) ?? 0) + 1);
  }
  return [...new Set(ROSTER)].every(kind => counts.get(kind) === ROSTER.filter(role => role === kind).length);
}

function legalDestinations(match: AuthoritativeMatch, piece: Piece): Coordinate[] {
  if (piece.kind === "bomb" || piece.kind === "flag") return [];
  const destinations: Coordinate[] = [];
  const directions = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  const distance = piece.kind === "scout" ? Math.max(match.width, match.height) : 1;
  for (const direction of directions) {
    for (let step = 1; step <= distance; step += 1) {
      const target = { x: piece.x + direction.x * step, y: piece.y + direction.y * step };
      if (target.x < 0 || target.y < 0 || target.x >= match.width || target.y >= match.height) break;
      if (LAKES.has(`${target.x}:${target.y}`)) break;
      const occupant = pieceAt(match.pieces, target);
      if (occupant) {
        if (occupant.owner !== piece.owner) destinations.push(target);
        break;
      }
      destinations.push(target);
    }
  }
  return destinations;
}

function resolveMove(match: AuthoritativeMatch, attacker: Piece, destination: Coordinate): MoveResolution {
  const defender = pieceAt(match.pieces, destination);
  if (!defender) return { pieces: movePiece(match.pieces, attacker, destination), captured: [] };
  if (defender.owner === attacker.owner) throw new RangeError("A friendly piece blocks that square");
  const revealed = [{ owner: attacker.owner, kind: attacker.kind }, { owner: defender.owner, kind: defender.kind }];
  if (defender.kind === "flag") {
    return {
      pieces: movePiece(match.pieces.filter(piece => piece.id !== defender.id), attacker, destination),
      captured: [defender], movedPiece: { ...attacker, ...destination }, winner: attacker.owner,
      reason: "flag-won", revealed,
    };
  }
  if (defender.kind === "bomb" && attacker.kind !== "miner") {
    return { pieces: match.pieces.filter(piece => piece.id !== attacker.id), captured: [attacker], revealed };
  }
  if (defender.kind === "bomb" || (attacker.kind === "spy" && defender.kind === "marshal")) {
    return {
      pieces: movePiece(match.pieces.filter(piece => piece.id !== defender.id), attacker, destination),
      captured: [defender], movedPiece: { ...attacker, ...destination }, revealed,
    };
  }
  if (attacker.kind === "spy" || defender.kind === "marshal" || defender.kind === "bomb") {
    return { pieces: match.pieces.filter(piece => piece.id !== attacker.id), captured: [attacker], revealed };
  }
  const attackRank = RANK.get(attacker.kind)!;
  const defendRank = RANK.get(defender.kind)!;
  if (attackRank === defendRank) {
    return { pieces: match.pieces.filter(piece => piece.id !== attacker.id && piece.id !== defender.id), captured: [attacker, defender], revealed };
  }
  if (attackRank < defendRank) return { pieces: match.pieces.filter(piece => piece.id !== attacker.id), captured: [attacker], revealed };
  return {
    pieces: movePiece(match.pieces.filter(piece => piece.id !== defender.id), attacker, destination),
    captured: [defender], movedPiece: { ...attacker, ...destination }, revealed,
  };
}

export function strategoCombat(attacker: string, defender: string): "attacker" | "defender" | "both" {
  if (defender === "flag") return "attacker";
  if (attacker === "flag") return "defender";
  if (defender === "bomb") return attacker === "miner" ? "attacker" : "defender";
  if (attacker === "bomb") return "defender";
  if (attacker === "spy" && defender === "marshal") return "attacker";
  if (attacker === "marshal" && defender === "spy") return "attacker";
  const attack = RANK.get(attacker)!;
  const defend = RANK.get(defender)!;
  return attack === defend ? "both" : attack > defend ? "attacker" : "defender";
}
