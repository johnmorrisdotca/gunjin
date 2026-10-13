/** The player whose private side is red.
 *
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 *
 * const value: Player = 0;
 * console.log(value);
 * ```
 */
export type Player = 0 | 1;
/** Selects one of the five rule modules supported by this package.
 *
 * @example
 * ```ts
 * import type { GameMode } from "@johnmorrisdotca/gunjin";
 *
 * const value: GameMode = "hidden-hasami";
 * console.log(value);
 * ```
 */
export type GameMode = "hidden-hasami" | "luzhanqi-mini" | "salpakan" | "stratego-lite" | "gunjin-shogi";
/** Zero-based board location shared by engine actions and public views.
 *
 * @example
 * ```ts
 * import type { Coordinate } from "@johnmorrisdotca/gunjin";
 *
 * const value: Coordinate = {x:0,y:6};
 * console.log(value);
 * ```
 */
export type Coordinate = { x: number; y: number };

/** Authoritative role-bearing piece. Keep this type and full match state on a trusted host. */
export type Piece = Coordinate & {
  id: string;
  owner: Player;
  kind: string;
};

/** Current lifecycle phase of an authoritative match or player view. */
export type MatchPhase = "setup" | "pass" | "play" | "finished";
/** Reason the hotseat interface is waiting for the next player. */
export type PassPurpose = "setup" | "play" | "draw";
/** Public outcome recorded when a match ends.
 *
 * @example
 * ```ts
 * import type { MatchResult } from "@johnmorrisdotca/gunjin";
 *
 * const value: MatchResult = {winner:null,reason:"agreed-draw"};
 * console.log(value);
 * ```
 */
export type MatchResult = {
  winner: Player | null;
  reason: "objective-captured" | "capture-threshold" | "blocked" | "flag-won" | "flag-held" | "resigned" | "agreed-draw" | "repetition";
};

/** Role-free event record, with rank details only when that mode publishes them. */
export type PublicEvent = {
  turn: number;
  player: Player;
  from?: Coordinate;
  to?: Coordinate;
  capturedCells: readonly Coordinate[];
  capturedCount: number;
  revealed?: readonly { owner: Player; kind: string }[];
  outcome?: MatchResult;
};

/** Full role-bearing state. This is for trusted referees or a private host process only. */
export type AuthoritativeMatch = {
  mode: GameMode;
  width: number;
  height: number;
  phase: MatchPhase;
  currentPlayer: Player;
  passPurpose?: PassPurpose;
  setupStep: number;
  turn: number;
  privateSetups: readonly [readonly Piece[], readonly Piece[]];
  pieces: readonly Piece[];
  pendingFlagClaimant?: Player;
  drawOffer?: Player;
  positionCounts: Readonly<Record<string, number>>;
  log: readonly PublicEvent[];
  result?: MatchResult;
};

/** Move requests are public, deterministic and rejected if their turn is stale.
 *
 * @example
 * ```ts
 * import type { MoveAction, Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { legalMovesForCurrentPlayer } from "@johnmorrisdotca/gunjin/views";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * const action: MoveAction={...legalMovesForCurrentPlayer(ready,0)[0]!,expectedTurn:ready.turn};
 * const value: MoveAction = action;
 * console.log(value);
 * ```
 */
export type MoveAction = {
  from: Coordinate;
  to: Coordinate;
  expectedTurn: number;
};

/** Player-facing piece. Opponent `kind` is always null and opponent IDs are omitted.
 *
 * @example
 * ```ts
 * import type { ViewedPiece } from "@johnmorrisdotca/gunjin";
 *
 * const value: ViewedPiece = {owner:1,x:0,y:0,kind:null,hidden:true};
 * console.log(value);
 * ```
 */
export type ViewedPiece = Coordinate & {
  owner: Player;
  kind: string | null;
  hidden: boolean;
  id?: string;
};

/** Information safe to render for one player at the current pass boundary.
 *
 * @example
 * ```ts
 * import type { Player, PlayerView } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { viewForPlayer } from "@johnmorrisdotca/gunjin/views";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * const value: PlayerView = viewForPlayer(ready,0);
 * console.log(value);
 * ```
 */
export type PlayerView = {
  mode: GameMode;
  phase: MatchPhase;
  viewer: Player;
  currentPlayer: Player;
  width: number;
  height: number;
  pieces: readonly ViewedPiece[] | null;
  turn: number;
  setupStep: number;
  ownSetup: readonly Piece[] | null;
  publicLog: readonly PublicEvent[];
  result?: MatchResult;
  drawOffer?: Player;
};

/** Role-free current position suitable for observers and change callbacks.
 *
 * @example
 * ```ts
 * import type { Player, PublicPosition } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { publicPosition } from "@johnmorrisdotca/gunjin/views";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * const value: PublicPosition = publicPosition(ready);
 * console.log(value);
 * ```
 */
export type PublicPosition = {
  mode: GameMode;
  phase: MatchPhase;
  width: number;
  height: number;
  pieces: readonly Omit<ViewedPiece, "kind" | "id">[] | null;
  turn: number;
  result?: MatchResult;
};

/** A shareable record without private setups or piece IDs; only mode-published combat ranks may appear.
 *
 * @example
 * ```ts
 * import type { Player, PublicReplay } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { publicReplay } from "@johnmorrisdotca/gunjin";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * const firstSetup=submitHasamiSetup(base,0,home(0),base.setupStep);
 * let ready=acknowledgePass(firstSetup,1,firstSetup.turn);
 * ready=submitHasamiSetup(ready,1,home(1),ready.setupStep);
 * ready=acknowledgePass(ready,0,ready.turn);
 * const value: PublicReplay = publicReplay(ready);
 * console.log(value);
 * ```
 */
export type PublicReplay = {
  version: 1;
  mode: GameMode;
  width: number;
  height: number;
  events: readonly PublicEvent[];
  result?: MatchResult;
};

/** Optional dimensions accepted by modes that support more than one board size. */
export type SetupSize = { width?: number; height?: number };
