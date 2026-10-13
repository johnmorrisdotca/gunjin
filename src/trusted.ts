import { MODE_RULES } from "./rules/index.ts";
import { createMatch } from "./match.ts";
import type { AuthoritativeMatch, GameMode, Piece } from "./types.ts";

/**
 * Host-only serialization. The returned string contains both players' secret roles;
 * never send it to a browser, another player, or a public replay endpoint.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @returns Host-only serialization. The returned string contains both players' secret roles; never send it to a browser, another player, or a public replay endpoint.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { encodeTrustedMatch } from "@johnmorrisdotca/gunjin/trusted";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * console.log(encodeTrustedMatch(ready).length);
 * ```
 */
export function encodeTrustedMatch(match: AuthoritativeMatch): string {
  return JSON.stringify({ version: 1, match });
}

/** Reads trusted host storage. The caller must keep the decoded match private.
 *
 * @param code - A trusted host record or redacted public replay, as required by this signature.
 * @returns The trusted host state when its structural checks pass, or null for refused/unsupported storage; private roles remain.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { decodeTrustedMatch, encodeTrustedMatch } from "@johnmorrisdotca/gunjin/trusted";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * console.log(decodeTrustedMatch(encodeTrustedMatch(ready))?.phase);
 * ```
 */
export function decodeTrustedMatch(code: string): AuthoritativeMatch | null {
  try {
    if (code.length > 250_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isMatch(value.match)) return null;
    return value.match;
  } catch {
    return null;
  }
}

function isMatch(value: unknown): value is AuthoritativeMatch {
  if (!value || typeof value !== "object") return false;
  const match = value as AuthoritativeMatch;
  if (!isMode(match.mode) || !Array.isArray(match.pieces) || !Array.isArray(match.privateSetups)) return false;
  try {
    createMatch(match.mode, { width: match.width, height: match.height });
  } catch {
    return false;
  }
  if (
    !["setup", "pass", "play", "finished"].includes(match.phase) ||
    (match.currentPlayer !== 0 && match.currentPlayer !== 1) ||
    !Number.isInteger(match.setupStep) || match.setupStep < 0 || match.setupStep > 2 ||
    !Number.isInteger(match.turn) || match.turn < 0 ||
    (match.drawOffer !== undefined && match.drawOffer !== 0 && match.drawOffer !== 1) ||
    (match.passPurpose !== undefined && !["setup", "play", "draw"].includes(match.passPurpose)) ||
    match.privateSetups.length !== 2 ||
    match.privateSetups.some((pieces: unknown) => !Array.isArray(pieces) || !pieces.every(piece => isPiece(piece, match)))
  ) {
    return false;
  }
  return match.pieces.every(piece => isPiece(piece, match));
}

function isMode(mode: unknown): mode is GameMode {
  return mode === "hidden-hasami" || mode === "luzhanqi-mini" || mode === "salpakan" ||
    mode === "stratego-lite" || mode === "gunjin-shogi";
}

function isPiece(value: unknown, match: AuthoritativeMatch): value is Piece {
  if (!value || typeof value !== "object") return false;
  const piece = value as Piece;
  return typeof piece.id === "string" && piece.id.length > 0 &&
    typeof piece.kind === "string" &&
    (piece.owner === 0 || piece.owner === 1) &&
    Number.isInteger(piece.x) && piece.x >= 0 && piece.x < match.width &&
    Number.isInteger(piece.y) && piece.y >= 0 && piece.y < match.height &&
    MODE_RULES[match.mode].roster(piece.owner, match.width, match.height).includes(piece.kind);
}
