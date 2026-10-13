import { createMatch, playMove, submitSetup } from "./match.ts";
import { LUZHANQI_MINI_RULES } from "./rules/luzhanqiMini.ts";
import type { MoveAction, Player } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Makes the fixed 7×8 streamlined land-battle training game.
 *
 * @returns Makes the fixed 7×8 streamlined land-battle training game.
 * @example
 * ```ts
 * import { createLuzhanqiMiniMatch } from "@johnmorrisdotca/gunjin/luzhanqi-mini";
 *
 * console.log(createLuzhanqiMiniMatch().phase);
 * ```
 */
export function createLuzhanqiMiniMatch() {
  return createMatch("luzhanqi-mini");
}

/** Returns the ordered 14-piece setup roster for one side.
 *
 * @returns Returns the ordered 14-piece setup roster for one side.
 * @example
 * ```ts
 * import { luzhanqiMiniRoster } from "@johnmorrisdotca/gunjin/luzhanqi-mini";
 *
 * console.log(luzhanqiMiniRoster());
 * ```
 */
export function luzhanqiMiniRoster(): readonly string[] {
  return LUZHANQI_MINI_RULES.roster(0, 7, 8);
}

/** Submits a complete side setup and advances the hotseat setup phase.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param placements - A complete native roster placed in this mode’s allowed home cells.
 * @param expectedSetupStep - The setup step seen by the caller, used to reject stale submissions.
 * @returns Submits a complete side setup and advances the hotseat setup phase.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createLuzhanqiMiniMatch, luzhanqiMiniRoster, submitLuzhanqiMiniSetup } from "@johnmorrisdotca/gunjin/luzhanqi-mini";
 *
 * const luzHome=(player: Player)=>{
 *  const y=player===0?7:0,front=player===0?6:1;
 *  const special=[{kind:"flag",x:1,y},{kind:"mine",x:0,y},{kind:"mine",x:2,y},{kind:"bomb",x:3,y},{kind:"bomb",x:4,y}];
 *  const cells=[{x:5,y},{x:6,y},...Array.from({length:7},(_,x)=>({x,y:front}))];
 *  return [...special,...luzhanqiMiniRoster().filter(kind=>!["flag","mine","bomb"].includes(kind)).map((kind,i)=>({kind,...cells[i]}))];
 * };
 * const luzBase=createLuzhanqiMiniMatch();
 * console.log(submitLuzhanqiMiniSetup(luzBase,0,luzHome(0),luzBase.setupStep).phase);
 * ```
 */
export function submitLuzhanqiMiniSetup(
  match: ReturnType<typeof createMatch>,
  player: Player,
  placements: readonly SetupPiece[],
  expectedSetupStep: number,
) {
  requireMode(match);
  return submitSetup(match, player, placements, expectedSetupStep);
}

/** Applies a legal move action, rejecting stale turn numbers.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param action - Native source/destination coordinates and the caller’s expected turn.
 * @returns Applies a legal move action, rejecting stale turn numbers.
 * @example
 * ```ts
 * import type { MoveAction, Player } from "@johnmorrisdotca/gunjin";
 * import { createLuzhanqiMiniMatch, luzhanqiMiniRoster, playLuzhanqiMiniMove, submitLuzhanqiMiniSetup } from "@johnmorrisdotca/gunjin/luzhanqi-mini";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { legalMovesForCurrentPlayer } from "@johnmorrisdotca/gunjin/views";
 *
 * const luzHome=(player: Player)=>{
 *  const y=player===0?7:0,front=player===0?6:1;
 *  const special=[{kind:"flag",x:1,y},{kind:"mine",x:0,y},{kind:"mine",x:2,y},{kind:"bomb",x:3,y},{kind:"bomb",x:4,y}];
 *  const cells=[{x:5,y},{x:6,y},...Array.from({length:7},(_,x)=>({x,y:front}))];
 *  return [...special,...luzhanqiMiniRoster().filter(kind=>!["flag","mine","bomb"].includes(kind)).map((kind,i)=>({kind,...cells[i]}))];
 * };
 * const luzBase=createLuzhanqiMiniMatch();
 * const luzFirst=submitLuzhanqiMiniSetup(luzBase,0,luzHome(0),luzBase.setupStep);
 * let luzReady=acknowledgePass(luzFirst,1,luzFirst.turn);
 * luzReady=submitLuzhanqiMiniSetup(luzReady,1,luzHome(1),luzReady.setupStep);
 * luzReady=acknowledgePass(luzReady,0,luzReady.turn);
 * const luzAction: MoveAction={...legalMovesForCurrentPlayer(luzReady,0)[0]!,expectedTurn:luzReady.turn};
 * console.log(playLuzhanqiMiniMove(luzReady,0,luzAction).phase);
 * ```
 */
export function playLuzhanqiMiniMove(
  match: ReturnType<typeof createMatch>,
  player: Player,
  action: MoveAction,
) {
  requireMode(match);
  return playMove(match, player, action);
}

function requireMode(match: ReturnType<typeof createMatch>): void {
  if (match.mode !== "luzhanqi-mini") throw new RangeError("This match uses a different Gunjin mode");
}
