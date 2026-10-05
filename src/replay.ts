import type { AuthoritativeMatch, MatchResult, PublicReplay, PublicEvent } from "./types.ts";
import { MODE_RULES } from "./rules/index.ts";

/** Creates a public replay with only combat ranks that the selected rules expose. */
export function publicReplay(match: AuthoritativeMatch): PublicReplay {
  return {
    version: 1,
    mode: match.mode,
    width: match.width,
    height: match.height,
    events: match.log.map(event => ({
      turn: event.turn,
      player: event.player,
      from: event.from ? { ...event.from } : undefined,
      to: event.to ? { ...event.to } : undefined,
      capturedCells: event.capturedCells.map(cell => ({ ...cell })),
      capturedCount: event.capturedCount,
      revealed: match.mode === "stratego-lite"
        ? event.revealed?.map(piece => ({ ...piece }))
        : undefined,
      outcome: event.outcome ? { ...event.outcome } : undefined,
    })),
    result: match.result ? { ...match.result } : undefined,
  };
}

export function encodePublicReplay(match: AuthoritativeMatch): string {
  return JSON.stringify(publicReplay(match));
}

/** Validates a role-free replay record for display; it cannot resume a match. */
export function decodePublicReplay(code: string): PublicReplay | null {
  try {
    if (code.length > 200_000) return null;
    const value = JSON.parse(code) as PublicReplay;
    if (
      value.version !== 1 ||
      !["hidden-hasami", "luzhanqi-mini", "salpakan", "stratego-lite", "gunjin-shogi"].includes(value.mode) ||
      !Number.isInteger(value.width) ||
      !Number.isInteger(value.height) ||
      value.width < 1 ||
      value.height < 1 ||
      !MODE_RULES[value.mode].acceptsSize(value.width, value.height) ||
      !Array.isArray(value.events)
    ) {
      return null;
    }
    const events: PublicEvent[] = [];
    let previousTurn = 0;
    for (const event of value.events) {
      if (
        !Number.isInteger(event.turn) || event.turn <= previousTurn ||
        (event.player !== 0 && event.player !== 1) ||
        !Array.isArray(event.capturedCells) ||
        event.capturedCells.some((cell: unknown) => !isCoordinate(cell, value.width, value.height)) ||
        !Number.isInteger(event.capturedCount) ||
        event.capturedCount < 0 || event.capturedCount !== event.capturedCells.length ||
        !isCoordinate(event.from, value.width, value.height) ||
        !isCoordinate(event.to, value.width, value.height) ||
        (event.outcome !== undefined && !isResult(event.outcome))
      ) {
        return null;
      }
      previousTurn = event.turn;
      events.push({
        turn: event.turn,
        player: event.player,
        from: { x: event.from.x, y: event.from.y },
        to: { x: event.to.x, y: event.to.y },
        capturedCells: event.capturedCells.map((cell: { x: number; y: number }) => ({ x: cell.x, y: cell.y })),
        capturedCount: event.capturedCount,
        revealed: value.mode === "stratego-lite" && Array.isArray((event as { revealed?: unknown }).revealed)
          ? ((event as { revealed?: unknown }).revealed as unknown[])
            .filter(isRevealedRank)
            .map(({ owner, kind }) => ({ owner, kind }))
          : undefined,
        outcome: event.outcome && isResult(event.outcome)
          ? { winner: event.outcome.winner, reason: event.outcome.reason }
          : undefined,
      });
    }
    if (value.result !== undefined && !isResult(value.result)) return null;
    return {
      version: 1,
      mode: value.mode,
      width: value.width,
      height: value.height,
      events,
      result: value.result && isResult(value.result)
        ? { winner: value.result.winner, reason: value.result.reason }
        : undefined,
    };
  } catch {
    return null;
  }
}

function isRevealedRank(value: unknown): value is { owner: 0 | 1; kind: string } {
  if (!value || typeof value !== "object") return false;
  const record = value as { owner?: unknown; kind?: unknown };
  return (record.owner === 0 || record.owner === 1) && typeof record.kind === "string";
}

function isCoordinate(value: unknown, width: number, height: number): value is { x: number; y: number } {
  return Boolean(value) && typeof value === "object" &&
    Number.isInteger((value as { x?: unknown }).x) &&
    Number.isInteger((value as { y?: unknown }).y) &&
    (value as { x: number }).x >= 0 && (value as { x: number }).x < width &&
    (value as { y: number }).y >= 0 && (value as { y: number }).y < height;
}

function isResult(value: unknown): value is MatchResult {
  if (!value || typeof value !== "object") return false;
  const result = value as { winner?: unknown; reason?: unknown };
  const reasons = ["objective-captured", "capture-threshold", "blocked", "flag-won", "flag-held", "resigned", "agreed-draw", "repetition"];
  return (result.winner === 0 || result.winner === 1 || result.winner === null) &&
    typeof result.reason === "string" && reasons.includes(result.reason);
}
