import type { AuthoritativeMatch, Coordinate, Piece, Player } from "../types.ts";
import { movePiece, pieceAt } from "./board.ts";
import type { ModeRules, MoveResolution, SetupPiece } from "./types.ts";

const ROSTER = [
  "general", "lieutenant-general", ...Array(2).fill("major-general"),
  ...Array(2).fill("colonel"), ...Array(2).fill("lieutenant-colonel"),
  ...Array(2).fill("major"), ...Array(2).fill("captain"),
  ...Array(2).fill("lieutenant"), ...Array(2).fill("second-lieutenant"),
  "aircraft", "aircraft", ...Array(3).fill("tank"),
  ...Array(2).fill("cavalry"), ...Array(3).fill("engineer"), "spy",
  ...Array(3).fill("mine"), "flag",
];
const RANK = ["general", "lieutenant-general", "major-general", "colonel", "lieutenant-colonel", "major", "captain", "lieutenant", "second-lieutenant", "cavalry"];
function isEnemyHeadquarters(player: Player, cell: Coordinate): boolean {
  return cell.y === (player === 0 ? 0 : 8) && (cell.x === 3 || cell.x === 5);
}

/** The documented 31-piece club ruleset, on a plain 9×9 board. */
export const GUNJIN_SHOGI_RULES: ModeRules = {
  mode: "gunjin-shogi",
  defaultWidth: 9,
  defaultHeight: 9,
  acceptsSize: (width, height) => width === 9 && height === 9,
  roster: () => ROSTER,
  validateSetup,
  legalDestinations,
  resolveMove,
};

function validateSetup(player: Player, placements: readonly SetupPiece[]): boolean {
  if (placements.length !== ROSTER.length) return false;
  const rows = player === 0 ? [5, 6, 7, 8] : [0, 1, 2, 3];
  const occupied = new Set<string>();
  const counts = new Map<string, number>();
  for (const piece of placements) {
    if (!Number.isInteger(piece.x) || piece.x < 0 || piece.x > 8 || !rows.includes(piece.y)) return false;
    const key = `${piece.x}:${piece.y}`;
    if (occupied.has(key)) return false;
    occupied.add(key);
    counts.set(piece.kind, (counts.get(piece.kind) ?? 0) + 1);
    if (piece.kind === "mine" && new Set(["3:5", "5:5", "3:3", "5:3"]).has(key)) return false;
  }
  return [...new Set(ROSTER)].every(kind => counts.get(kind) === ROSTER.filter(role => role === kind).length);
}

function legalDestinations(match: AuthoritativeMatch, piece: Piece): Coordinate[] {
  if (piece.kind === "mine") return [];
  if (piece.kind === "aircraft") {
    const targets: Coordinate[] = [];
    for (let y = 0; y < match.height; y += 1) {
      for (let x = 0; x < match.width; x += 1) {
        const occupant = pieceAt(match.pieces, { x, y });
        if (!occupant || occupant.owner !== piece.owner) targets.push({ x, y });
      }
    }
    return targets.filter(target => target.x !== piece.x || target.y !== piece.y);
  }
  const directions = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  const limit = piece.kind === "engineer" ? Math.max(match.width, match.height) : piece.kind === "cavalry" ? 3 : ["captain", "lieutenant", "second-lieutenant"].includes(piece.kind) ? 2 : 1;
  const destinations: Coordinate[] = [];
  for (const direction of directions) {
    for (let step = 1; step <= limit; step += 1) {
      const target = { x: piece.x + direction.x * step, y: piece.y + direction.y * step };
      if (target.x < 0 || target.y < 0 || target.x >= match.width || target.y >= match.height) break;
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
  if (!defender) {
    const pieces = movePiece(match.pieces, attacker, destination);
    if (isEnemyHeadquarters(attacker.owner, destination) && !["tank", "aircraft", "engineer"].includes(attacker.kind)) {
      return { pieces, captured: [], movedPiece: { ...attacker, ...destination }, winner: attacker.owner, reason: "flag-won" };
    }
    return { pieces, captured: [], movedPiece: { ...attacker, ...destination } };
  }
  if (defender.owner === attacker.owner) throw new RangeError("A friendly piece blocks that square");
  const result = gunjinCombat(attacker.kind, defender.kind);
  if (result === "both") return { pieces: match.pieces.filter(piece => piece.id !== attacker.id && piece.id !== defender.id), captured: [attacker, defender] };
  if (result === "defender") return { pieces: match.pieces.filter(piece => piece.id !== attacker.id), captured: [attacker] };
  const pieces = movePiece(match.pieces.filter(piece => piece.id !== defender.id), attacker, destination);
  if (isEnemyHeadquarters(attacker.owner, destination) && !["tank", "aircraft", "engineer"].includes(attacker.kind)) {
    return {
      pieces, captured: [defender], movedPiece: { ...attacker, ...destination },
      winner: attacker.owner, reason: "flag-won",
    };
  }
  return { pieces, captured: [defender], movedPiece: { ...attacker, ...destination } };
}

/** Resolves a club-rules Gunjin Shogi battle without mutating match state. */
export function gunjinCombat(attacker: string, defender: string): "attacker" | "defender" | "both" {
  if (attacker === defender) return "both";
  if (attacker === "flag" || defender === "flag") return "both";
  if (defender === "mine") return attacker === "aircraft" || attacker === "engineer" ? "attacker" : "defender";
  if (attacker === "mine") return defender === "aircraft" || defender === "engineer" ? "defender" : "attacker";
  if (attacker === "spy") return ["general", "lieutenant-general"].includes(defender) ? "attacker" : "defender";
  if (defender === "spy") return ["general", "lieutenant-general"].includes(attacker) ? "defender" : "attacker";
  if (attacker === "aircraft") return ["general", "lieutenant-general", "major-general"].includes(defender) ? "defender" : "attacker";
  if (defender === "aircraft") return ["general", "lieutenant-general", "major-general"].includes(attacker) ? "attacker" : "defender";
  if (attacker === "tank") return ["general", "lieutenant-general", "major-general", "aircraft", "engineer", "mine"].includes(defender) ? "defender" : "attacker";
  if (defender === "tank") return ["general", "lieutenant-general", "major-general", "aircraft", "engineer", "mine"].includes(attacker) ? "attacker" : "defender";
  if (attacker === "engineer") return ["mine", "spy", "tank"].includes(defender) ? "attacker" : "defender";
  if (defender === "engineer") return ["mine", "spy", "tank"].includes(attacker) ? "defender" : "attacker";
  const attack = RANK.indexOf(attacker);
  const defend = RANK.indexOf(defender);
  if (attack < 0 || defend < 0) throw new RangeError("Unknown Gunjin Shogi rank");
  return attack < defend ? "attacker" : "defender";
}
