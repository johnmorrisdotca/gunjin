import { MODE_RULES } from "./rules/index.ts";
import { isCamp, isHeadquarters } from "./rules/luzhanqiMini.ts";
import { isLake } from "./rules/strategoLite.ts";
import type {
  AuthoritativeMatch,
  Coordinate,
  MatchResult,
  Player,
  PlayerView,
  PublicPosition,
  ViewedPiece,
} from "./types.ts";

/** A player view redacts opponent roles and suppresses the board during device handoff. */
export function viewForPlayer(
  match: AuthoritativeMatch,
  viewer: Player,
): PlayerView {
  const canSeeBoard = match.phase === "play" || match.phase === "finished";
  const pieces: ViewedPiece[] | null = canSeeBoard
    ? match.pieces.map(piece => piece.owner === viewer
      ? { id: piece.id, owner: piece.owner, x: piece.x, y: piece.y, kind: piece.kind, hidden: false }
      : { owner: piece.owner, x: piece.x, y: piece.y, kind: null, hidden: true })
    : null;

  return {
    mode: match.mode,
    phase: match.phase,
    viewer,
    currentPlayer: match.currentPlayer,
    width: match.width,
    height: match.height,
    pieces,
    turn: match.turn,
    setupStep: match.setupStep,
    ownSetup: match.phase === "setup"
      ? match.privateSetups[viewer].map(piece => ({ ...piece }))
      : null,
    publicLog: match.log.map(event => ({
      turn: event.turn,
      player: event.player,
      from: event.from ? { x: event.from.x, y: event.from.y } : undefined,
      to: event.to ? { x: event.to.x, y: event.to.y } : undefined,
      capturedCells: event.capturedCells.map(cell => ({ x: cell.x, y: cell.y })),
      capturedCount: event.capturedCount,
      revealed: match.mode === "stratego-lite"
        ? event.revealed?.map(piece => ({ ...piece }))
        : undefined,
      outcome: event.outcome ? safeResult(event.outcome) : undefined,
    })),
    result: match.result ? safeResult(match.result) : undefined,
    drawOffer: match.drawOffer,
  };
}

/** Redacted position for spectators: only player ownership and occupied cells are returned. */
export function publicPosition(match: AuthoritativeMatch): PublicPosition {
  return {
    mode: match.mode,
    phase: match.phase,
    width: match.width,
    height: match.height,
    pieces: match.phase === "play" || match.phase === "finished"
      ? match.pieces.map(({ owner, x, y }) => ({ owner, x, y, hidden: true }))
      : null,
    turn: match.turn,
    result: match.result ? safeResult(match.result) : undefined,
  };
}

function safeResult(result: MatchResult): MatchResult {
  return { winner: result.winner, reason: result.reason };
}

/** Legal move coordinates for the player whose turn it is; roles are never returned. */
export function legalMovesForCurrentPlayer(
  match: AuthoritativeMatch,
  player: Player,
): { from: Coordinate; to: Coordinate }[] {
  if (match.phase !== "play" || match.currentPlayer !== player) return [];
  const rules = MODE_RULES[match.mode];
  return match.pieces
    .filter(piece => piece.owner === player)
    .flatMap(piece => rules.legalDestinations(match, piece).map(to => ({
      from: { x: piece.x, y: piece.y },
      to,
    })));
}

/** Public board markings (camps, headquarters and lakes), with no role-dependent information. */
export function boardFeatures(
  mode: AuthoritativeMatch["mode"],
  width: number,
  height: number,
): { camps: Coordinate[]; headquarters: Coordinate[]; lakes: Coordinate[] } {
  if (mode === "gunjin-shogi") {
    return { camps: [], headquarters: [{ x: 3, y: 0 }, { x: 5, y: 0 }, { x: 3, y: 8 }, { x: 5, y: 8 }], lakes: [] };
  }
  if (mode === "stratego-lite") {
    const lakes: Coordinate[] = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) if (isLake({ x, y })) lakes.push({ x, y });
    }
    return { camps: [], headquarters: [], lakes };
  }
  if (mode !== "luzhanqi-mini") return { camps: [], headquarters: [], lakes: [] };
  const camps: Coordinate[] = [];
  const headquarters: Coordinate[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isCamp({ x, y })) camps.push({ x, y });
      if (isHeadquarters({ x, y })) headquarters.push({ x, y });
    }
  }
  return { camps, headquarters, lakes: [] };
}
