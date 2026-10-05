import type { AuthoritativeMatch, Coordinate, Piece, Player } from "../types.ts";
import { movePiece, orthogonalNeighbors, pieceAt } from "./board.ts";
import type { ModeRules, MoveResolution, SetupPiece } from "./types.ts";

const ROSTER = [
  "commander",
  "officer", "officer",
  "soldier", "soldier", "soldier",
  "engineer", "engineer", "engineer",
  "bomb", "bomb",
  "mine", "mine",
  "flag",
];
const CAMPS = new Set(["1:3", "5:3", "1:4", "5:4"]);
const HEADQUARTERS = new Set(["1:0", "5:0", "1:7", "5:7"]);

/** A deliberately streamlined original land-battle ruleset. */
export const LUZHANQI_MINI_RULES: ModeRules = {
  mode: "luzhanqi-mini",
  defaultWidth: 7,
  defaultHeight: 8,
  acceptsSize: (width, height) => width === 7 && height === 8,
  roster: () => ROSTER,
  validateSetup,
  legalDestinations,
  resolveMove,
};

export function isCamp(coordinate: Coordinate): boolean {
  return CAMPS.has(`${coordinate.x}:${coordinate.y}`);
}

export function isHeadquarters(coordinate: Coordinate): boolean {
  return HEADQUARTERS.has(`${coordinate.x}:${coordinate.y}`);
}

function validateSetup(
  player: Player,
  placements: readonly SetupPiece[],
): boolean {
  if (placements.length !== ROSTER.length) return false;
  const homeRow = player === 0 ? 7 : 0;
  const frontRow = player === 0 ? 6 : 1;
  const allowedRows = new Set([homeRow, frontRow]);
  const occupied = new Set<string>();
  const counts = new Map<string, number>();
  let flagInHeadquarters = false;

  for (const piece of placements) {
    if (
      !Number.isInteger(piece.x) || piece.x < 0 || piece.x > 6 ||
      !Number.isInteger(piece.y) || !allowedRows.has(piece.y) ||
      isCamp(piece)
    ) {
      return false;
    }
    const key = `${piece.x}:${piece.y}`;
    if (occupied.has(key)) return false;
    occupied.add(key);
    counts.set(piece.kind, (counts.get(piece.kind) ?? 0) + 1);
    if (piece.kind === "mine" && piece.y !== homeRow) return false;
    if (piece.kind === "bomb" && piece.y === frontRow) return false;
    if (piece.kind === "flag" && isHeadquarters(piece)) flagInHeadquarters = true;
  }

  if (!flagInHeadquarters) return false;
  return [...new Set(ROSTER)].every(kind =>
    counts.get(kind) === ROSTER.filter(role => role === kind).length,
  );
}

function legalDestinations(
  match: AuthoritativeMatch,
  piece: Piece,
): Coordinate[] {
  if (piece.kind === "mine" || piece.kind === "flag") return [];
  return orthogonalNeighbors(piece, match.width, match.height).filter(destination => {
    const occupant = pieceAt(match.pieces, destination);
    if (!occupant) return true;
    return occupant.owner !== piece.owner && !isCamp(destination);
  });
}

function resolveMove(
  match: AuthoritativeMatch,
  attacker: Piece,
  destination: Coordinate,
): MoveResolution {
  const defender = pieceAt(match.pieces, destination);
  if (defender?.owner === attacker.owner) throw new RangeError("A friendly piece blocks that square");
  if (defender && isCamp(destination)) throw new RangeError("A camp cannot be attacked");

  if (!defender) {
    return {
      pieces: movePiece(match.pieces, attacker, destination),
      captured: [],
      movedPiece: { ...attacker, ...destination },
    };
  }

  if (defender.kind === "flag") {
    const pieces = movePiece(
      match.pieces.filter(piece => piece.id !== defender.id),
      attacker,
      destination,
    );
    return {
      pieces,
      captured: [defender],
      movedPiece: { ...attacker, ...destination },
      winner: attacker.owner,
      reason: "flag-won",
    };
  }
  if (attacker.kind === "bomb" || defender.kind === "bomb") {
    return {
      pieces: match.pieces.filter(piece => piece.id !== attacker.id && piece.id !== defender.id),
      captured: [attacker, defender],
    };
  }
  if (defender.kind === "mine") {
    if (attacker.kind === "engineer") {
      return {
        pieces: movePiece(
          match.pieces.filter(piece => piece.id !== defender.id),
          attacker,
          destination,
        ),
        captured: [defender],
        movedPiece: { ...attacker, ...destination },
      };
    }
    return {
      pieces: match.pieces.filter(piece => piece.id !== attacker.id),
      captured: [attacker],
    };
  }

  const attackerRank = combatRank(attacker.kind);
  const defenderRank = combatRank(defender.kind);
  if (attackerRank === defenderRank) {
    return {
      pieces: match.pieces.filter(piece => piece.id !== attacker.id && piece.id !== defender.id),
      captured: [attacker, defender],
    };
  }
  if (attackerRank > defenderRank) {
    return {
      pieces: movePiece(
        match.pieces.filter(piece => piece.id !== defender.id),
        attacker,
        destination,
      ),
      captured: [defender],
      movedPiece: { ...attacker, ...destination },
    };
  }
  return {
    pieces: match.pieces.filter(piece => piece.id !== attacker.id),
    captured: [attacker],
  };
}

function combatRank(kind: string): number {
  return { engineer: 1, soldier: 2, officer: 3, commander: 4 }[kind as
    "engineer" | "soldier" | "officer" | "commander"] ?? 0;
}
