import type { AuthoritativeMatch, Coordinate, Piece, Player } from "../types.ts";
import { movePiece, orthogonalNeighbors, pieceAt } from "./board.ts";
import type { ModeRules, MoveResolution, SetupPiece } from "./types.ts";

const OFFICERS = [
  "five-star",
  "four-star",
  "three-star",
  "two-star",
  "one-star",
  "colonel",
  "lieutenant-colonel",
  "major",
  "captain",
  "first-lieutenant",
  "second-lieutenant",
  "sergeant",
] as const;
const ROSTER = [
  ...OFFICERS,
  ...Array(6).fill("private"),
  "spy",
  "spy",
  "flag",
];
const OFFICER_RANK = new Map<string, number>(OFFICERS.map((kind, index) => [kind, OFFICERS.length - index]));

/** Classic 9×8 Salpakan board and equipment with hidden battle outcomes. */
export const SALPAKAN_RULES: ModeRules = {
  mode: "salpakan",
  defaultWidth: 9,
  defaultHeight: 8,
  acceptsSize: (width, height) => width === 9 && height === 8,
  roster: () => ROSTER,
  validateSetup,
  legalDestinations,
  resolveMove,
};

function validateSetup(
  player: Player,
  placements: readonly SetupPiece[],
): boolean {
  if (placements.length !== ROSTER.length) return false;
  const homeRows = player === 0 ? new Set([5, 6, 7]) : new Set([0, 1, 2]);
  const occupied = new Set<string>();
  const counts = new Map<string, number>();

  for (const piece of placements) {
    if (
      !Number.isInteger(piece.x) || piece.x < 0 || piece.x > 8 ||
      !Number.isInteger(piece.y) || !homeRows.has(piece.y)
    ) {
      return false;
    }
    const key = `${piece.x}:${piece.y}`;
    if (occupied.has(key)) return false;
    occupied.add(key);
    counts.set(piece.kind, (counts.get(piece.kind) ?? 0) + 1);
  }

  return [...new Set(ROSTER)].every(kind =>
    counts.get(kind) === ROSTER.filter(role => role === kind).length,
  );
}

function legalDestinations(
  match: AuthoritativeMatch,
  piece: Piece,
): Coordinate[] {
  return orthogonalNeighbors(piece, match.width, match.height).filter(destination => {
    const occupant = pieceAt(match.pieces, destination);
    return !occupant || occupant.owner !== piece.owner;
  });
}

function resolveMove(
  match: AuthoritativeMatch,
  attacker: Piece,
  destination: Coordinate,
): MoveResolution {
  const defender = pieceAt(match.pieces, destination);
  if (defender?.owner === attacker.owner) throw new RangeError("A friendly piece blocks that square");

  if (!defender) {
    const pieces = movePiece(match.pieces, attacker, destination);
    return finishFlagAdvance(match, attacker, destination, pieces, [], attacker);
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
      clearPendingFlag: true,
    };
  }

  const winner = combatWinner(attacker.kind, defender.kind);
  if (winner === "both") {
    return finishEnemyTurn(
      match,
      attacker.owner,
      match.pieces.filter(piece => piece.id !== attacker.id && piece.id !== defender.id),
      [attacker, defender],
    );
  }
  if (winner === "attacker") {
    const pieces = movePiece(
      match.pieces.filter(piece => piece.id !== defender.id),
      attacker,
      destination,
    );
    return finishFlagAdvance(match, attacker, destination, pieces, [defender], {
      ...attacker,
      ...destination,
    });
  }

  const pieces = match.pieces.filter(piece => piece.id !== attacker.id);
  return finishEnemyTurn(match, attacker.owner, pieces, [attacker]);
}

type MovedPiece = Piece | undefined;

function finishFlagAdvance(
  match: AuthoritativeMatch,
  attacker: Piece,
  destination: Coordinate,
  pieces: readonly Piece[],
  captured: readonly Piece[],
  moved: MovedPiece,
): MoveResolution {
  const enemyBackRow = attacker.owner === 0 ? 0 : match.height - 1;
  if (attacker.kind === "flag" && destination.y === enemyBackRow) {
    if (
      match.pendingFlagClaimant !== undefined &&
      match.pendingFlagClaimant !== attacker.owner
    ) {
      return {
        pieces,
        captured,
        movedPiece: moved,
        winner: match.pendingFlagClaimant,
        reason: "flag-held",
        clearPendingFlag: true,
      };
    }
    return {
      pieces,
      captured,
      movedPiece: moved,
      pendingFlagClaimant: attacker.owner,
    };
  }
  return finishEnemyTurn(match, attacker.owner, pieces, captured, moved);
}

function finishEnemyTurn(
  match: AuthoritativeMatch,
  mover: Player,
  pieces: readonly Piece[],
  captured: readonly Piece[],
  movedPiece?: Piece,
): MoveResolution {
  const claimant = match.pendingFlagClaimant;
  if (claimant !== undefined && mover !== claimant) {
    return {
      pieces,
      captured,
      movedPiece,
      winner: claimant,
      reason: "flag-held",
      clearPendingFlag: true,
    };
  }
  return { pieces, captured, movedPiece };
}

export function combatWinner(
  attacker: string,
  defender: string,
): "attacker" | "defender" | "both" {
  if (defender === "flag") return "attacker";
  if (attacker === "flag") return "defender";
  if (attacker === "private" && defender === "spy") return "attacker";
  if (attacker === "spy" && defender === "private") return "defender";
  if (attacker === "spy" && OFFICER_RANK.has(defender)) return "attacker";
  if (defender === "spy" && OFFICER_RANK.has(attacker)) return "defender";

  const attackerRank = OFFICER_RANK.get(attacker) ?? 0;
  const defenderRank = OFFICER_RANK.get(defender) ?? 0;
  if (attackerRank === defenderRank) return "both";
  return attackerRank > defenderRank ? "attacker" : "defender";
}
