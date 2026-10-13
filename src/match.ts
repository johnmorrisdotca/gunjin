import { MODE_RULES } from "./rules/index.ts";
import { publicPositionKey } from "./rules/board.ts";
import type {
  AuthoritativeMatch,
  Coordinate,
  GameMode,
  MatchResult,
  MoveAction,
  Player,
  SetupSize,
} from "./types.ts";
import type { Piece } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Creates an authoritative match. Keep this state on a trusted host.
 *
 * @param mode - The native rule-mode key.
 * @param size - A supported board size; Hasami accepts 7 or 9 square holes per side.
 * @returns Creates an authoritative match. Keep this state on a trusted host.
 * @example
 * ```ts
 * import { createMatch } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * console.log(createMatch("gunjin-shogi").phase);
 * ```
 */
export function createMatch(
  mode: GameMode,
  size: SetupSize = {},
): AuthoritativeMatch {
  const rules = MODE_RULES[mode];
  if (!rules) throw new RangeError("Unknown Gunjin mode");
  const width = size.width ?? rules.defaultWidth;
  const height = size.height ?? rules.defaultHeight;
  if (!rules.acceptsSize(width, height)) throw new RangeError("Unsupported board size for this mode");
  return {
    mode,
    width,
    height,
    phase: "setup",
    currentPlayer: 0,
    setupStep: 0,
    turn: 0,
    privateSetups: [[], []],
    pieces: [],
    positionCounts: {},
    log: [],
  };
}

/** The private roster for the player currently arranging their side.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @returns The private roster for the player currently arranging their side.
 * @example
 * ```ts
 * import { createHasamiMatch } from "@johnmorrisdotca/gunjin/hasami";
 * import { rosterForSetup } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * const base=createHasamiMatch({width:7,height:7});
 * console.log(rosterForSetup(base,0));
 * ```
 */
export function rosterForSetup(
  match: AuthoritativeMatch,
  player: Player,
): readonly string[] {
  return MODE_RULES[match.mode].roster(player, match.width, match.height);
}

/** Submits one player's hidden setup and then shows a pass-device screen.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param placements - A complete native roster placed in this mode’s allowed home cells.
 * @param expectedSetupStep - The setup step seen by the caller, used to reject stale submissions.
 * @returns Submits one player's hidden setup and then shows a pass-device screen.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster } from "@johnmorrisdotca/gunjin/hasami";
 * import { submitSetup } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * console.log(submitSetup(base,0,home(0),base.setupStep).phase);
 * ```
 */
export function submitSetup(
  match: AuthoritativeMatch,
  player: Player,
  placements: readonly SetupPiece[],
  expectedSetupStep: number,
): AuthoritativeMatch {
  if (
    match.phase !== "setup" ||
    match.currentPlayer !== player ||
    match.setupStep !== expectedSetupStep
  ) {
    throw new RangeError("The setup is stale or belongs to the other player");
  }

  const rules = MODE_RULES[match.mode];
  const roster = rules.roster(player, match.width, match.height);
  if (
    placements.length !== roster.length ||
    !rules.validateSetup(player, placements) ||
    !matchesRoster(placements, roster)
  ) {
    throw new RangeError("That setup does not meet this mode's placement rules");
  }

  const setup: Piece[] = placements.map((piece, index) => ({
    ...piece,
    id: `${match.mode}:${player}:${index}`,
    owner: player,
  }));
  const setups = [...match.privateSetups] as [readonly Piece[], readonly Piece[]];
  setups[player] = setup;
  const setupStep = match.setupStep + 1;
  const isSecondSetup = setupStep === 2;
  const pieces = isSecondSetup
    ? [...setups[0], ...setups[1]]
    : match.pieces;

  return {
    ...match,
    privateSetups: setups,
    pieces,
    setupStep,
    phase: "pass",
    currentPlayer: isSecondSetup ? 0 : 1,
    passPurpose: isSecondSetup ? "play" : "setup",
  };
}

/** Confirms that the device has passed to the player named on the cover screen.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param expectedTurn - The turn seen by the caller, used to reject stale or out-of-turn requests.
 * @returns Confirms that the device has passed to the player named on the cover screen.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * console.log(acknowledgePass(firstSetup,1,firstSetup.turn).phase);
 * ```
 */
export function acknowledgePass(
  match: AuthoritativeMatch,
  player: Player,
  expectedTurn: number,
): AuthoritativeMatch {
  if (
    match.phase !== "pass" ||
    match.currentPlayer !== player ||
    match.turn !== expectedTurn
  ) {
    throw new RangeError("The pass-device confirmation is stale or belongs to the other player");
  }
  if (match.passPurpose === "setup") {
    return { ...match, phase: "setup", passPurpose: undefined };
  }

  const active: AuthoritativeMatch = {
    ...match,
    phase: "play",
    passPurpose: undefined,
  };
  if (match.passPurpose === "draw") return active;
  return {
    ...active,
    positionCounts: { [publicPositionKey(active)]: 1 },
  };
}

/** Current-player moves with deterministic stale-turn rejection.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param action - Native source/destination coordinates and the caller’s expected turn.
 * @returns Current-player moves with deterministic stale-turn rejection.
 * @example
 * ```ts
 * import type { MoveAction, Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass, playMove } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { legalMovesForCurrentPlayer } from "@johnmorrisdotca/gunjin/views";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * const action: MoveAction={...legalMovesForCurrentPlayer(ready,0)[0]!,expectedTurn:ready.turn};
 * console.log(playMove(ready,0,action).phase);
 * ```
 */
export function playMove(
  match: AuthoritativeMatch,
  player: Player,
  action: MoveAction,
): AuthoritativeMatch {
  if (
    match.phase !== "play" ||
    match.result ||
    match.currentPlayer !== player ||
    action.expectedTurn !== match.turn
  ) {
    throw new RangeError("The move is stale, out of turn, or the match is not playing");
  }

  const moving = match.pieces.find(piece =>
    piece.owner === player && piece.x === action.from.x && piece.y === action.from.y,
  );
  if (!moving) throw new RangeError("There is no moving player's piece at that cell");

  const rules = MODE_RULES[match.mode];
  const legal = rules.legalDestinations(match, moving);
  if (!legal.some(destination => sameCoordinate(destination, action.to))) {
    throw new RangeError("That destination is not a legal move");
  }

  const resolution = rules.resolveMove(match, moving, action.to);
  const nextPlayer = (1 - player) as Player;
  const turn = match.turn + 1;
  let next: AuthoritativeMatch = {
    ...match,
    pieces: resolution.pieces,
    turn,
    currentPlayer: nextPlayer,
    phase: "pass",
    passPurpose: "play",
    pendingFlagClaimant: resolution.clearPendingFlag
      ? undefined
      : resolution.pendingFlagClaimant ?? match.pendingFlagClaimant,
    drawOffer: undefined,
  };

  const result = resolution.winner !== undefined
    ? { winner: resolution.winner, reason: resolution.reason! } satisfies MatchResult
    : undefined;
  const event = {
    turn,
    player,
    from: action.from,
    to: action.to,
    capturedCells: resolution.captured.map(({ x, y }) => ({ x, y })),
    capturedCount: resolution.captured.length,
    revealed: resolution.revealed?.map(piece => ({ owner: piece.owner, kind: piece.kind })),
    outcome: result,
  };
  next = { ...next, log: [...match.log, event] };

  if (result) return finish(next, result);
  if (match.mode === "hidden-hasami") {
    const key = publicPositionKey(next);
    const count = (match.positionCounts[key] ?? 0) + 1;
    if (count >= 3) return finish(next, { winner: null, reason: "repetition" });
    next = { ...next, positionCounts: { ...match.positionCounts, [key]: count } };
  }

  if (!hasAnyLegalMove(next, nextPlayer)) {
    return finish(next, { winner: player, reason: "blocked" });
  }
  return next;
}

/** Resignation is public and ends the active player's match.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param expectedTurn - The turn seen by the caller, used to reject stale or out-of-turn requests.
 * @returns Resignation is public and ends the active player's match.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass, resignMatch } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * console.log(resignMatch(ready,0,ready.turn).result);
 * ```
 */
export function resignMatch(
  match: AuthoritativeMatch,
  player: Player,
  expectedTurn: number,
): AuthoritativeMatch {
  if (match.phase !== "play" || match.currentPlayer !== player || match.turn !== expectedTurn) {
    throw new RangeError("The resignation is stale or out of turn");
  }
  return finish(match, { winner: (1 - player) as Player, reason: "resigned" });
}

/** Offers a draw; the other player must accept it on their turn.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param expectedTurn - The turn seen by the caller, used to reject stale or out-of-turn requests.
 * @returns Offers a draw; the other player must accept it on their turn.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass, offerDraw } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * console.log(offerDraw(ready,0,ready.turn).phase);
 * ```
 */
export function offerDraw(
  match: AuthoritativeMatch,
  player: Player,
  expectedTurn: number,
): AuthoritativeMatch {
  if (match.phase !== "play" || match.currentPlayer !== player || match.turn !== expectedTurn) {
    throw new RangeError("The draw offer is stale or out of turn");
  }
  if (match.drawOffer === (1 - player)) {
    throw new RangeError("The opponent's draw offer has to be accepted or declined first");
  }
  return {
    ...match,
    phase: "pass",
    passPurpose: "draw",
    currentPlayer: (1 - player) as Player,
    drawOffer: player,
  };
}

/** Accepts the other player's pending draw offer using the current turn token.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param expectedTurn - The turn seen by the caller, used to reject stale or out-of-turn requests.
 * @returns Accepts the other player's pending draw offer using the current turn token.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acceptDraw, acknowledgePass, offerDraw } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * const offered=offerDraw(ready,0,ready.turn);
 * const received=acknowledgePass(offered,1,offered.turn);
 * console.log(acceptDraw(received,1,received.turn).result);
 * ```
 */
export function acceptDraw(
  match: AuthoritativeMatch,
  player: Player,
  expectedTurn: number,
): AuthoritativeMatch {
  if (
    match.phase !== "play" ||
    match.currentPlayer !== player ||
    match.turn !== expectedTurn ||
    match.drawOffer !== (1 - player)
  ) {
    throw new RangeError("There is no current opponent draw offer to accept");
  }
  return finish(match, { winner: null, reason: "agreed-draw" });
}

/** Makes a declined draw offer available again to the moving player.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param expectedTurn - The turn seen by the caller, used to reject stale or out-of-turn requests.
 * @returns Makes a declined draw offer available again to the moving player.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass, declineDraw, offerDraw } from "@johnmorrisdotca/gunjin/stratego-lite";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * const offered=offerDraw(ready,0,ready.turn);
 * const received=acknowledgePass(offered,1,offered.turn);
 * console.log(declineDraw(received,1,received.turn).drawOffer);
 * ```
 */
export function declineDraw(
  match: AuthoritativeMatch,
  player: Player,
  expectedTurn: number,
): AuthoritativeMatch {
  if (
    match.phase !== "play" ||
    match.currentPlayer !== player ||
    match.turn !== expectedTurn ||
    match.drawOffer !== (1 - player)
  ) {
    throw new RangeError("There is no current opponent draw offer to decline");
  }
  return { ...match, drawOffer: undefined };
}

function hasAnyLegalMove(match: AuthoritativeMatch, player: Player): boolean {
  const rules = MODE_RULES[match.mode];
  return match.pieces.some(piece =>
    piece.owner === player && rules.legalDestinations(match, piece).length > 0,
  );
}

function matchesRoster(
  placements: readonly SetupPiece[],
  roster: readonly string[],
): boolean {
  const expected = countKinds(roster);
  const actual = countKinds(placements.map(piece => piece.kind));
  return expected.size === actual.size &&
    [...expected].every(([kind, count]) => actual.get(kind) === count);
}

function countKinds(kinds: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const kind of kinds) counts.set(kind, (counts.get(kind) ?? 0) + 1);
  return counts;
}

function sameCoordinate(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

function finish(match: AuthoritativeMatch, result: MatchResult): AuthoritativeMatch {
  return { ...match, phase: "finished", result, drawOffer: undefined };
}
