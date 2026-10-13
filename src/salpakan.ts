import { createMatch, playMove, submitSetup } from "./match.ts";
import { SALPAKAN_RULES } from "./rules/salpakan.ts";
import type { MoveAction, Player } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Makes the fixed classic 9×8 Salpakan match.
 *
 * @returns Makes the fixed classic 9×8 Salpakan match.
 * @example
 * ```ts
 * import { createSalpakanMatch } from "@johnmorrisdotca/gunjin/salpakan";
 *
 * console.log(createSalpakanMatch().phase);
 * ```
 */
export function createSalpakanMatch() {
  return createMatch("salpakan");
}

/** Returns the ordered 21-piece setup roster for one side.
 *
 * @returns Returns the ordered 21-piece setup roster for one side.
 * @example
 * ```ts
 * import { salpakanRoster } from "@johnmorrisdotca/gunjin/salpakan";
 *
 * console.log(salpakanRoster());
 * ```
 */
export function salpakanRoster(): readonly string[] {
  return SALPAKAN_RULES.roster(0, 9, 8);
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
 * import { createSalpakanMatch, salpakanRoster, submitSalpakanSetup } from "@johnmorrisdotca/gunjin/salpakan";
 *
 * const salHome=(player: Player)=>salpakanRoster().map((kind,i)=>({kind,x:i%9,y:player===0?7-Math.floor(i/9):Math.floor(i/9)}));
 * const salBase=createSalpakanMatch();
 * console.log(submitSalpakanSetup(salBase,0,salHome(0),salBase.setupStep).phase);
 * ```
 */
export function submitSalpakanSetup(
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
 * import { createSalpakanMatch, playSalpakanMove, salpakanRoster, submitSalpakanSetup } from "@johnmorrisdotca/gunjin/salpakan";
 * import { acknowledgePass } from "@johnmorrisdotca/gunjin/stratego-lite";
 * import { legalMovesForCurrentPlayer } from "@johnmorrisdotca/gunjin/views";
 *
 * const salHome=(player: Player)=>salpakanRoster().map((kind,i)=>({kind,x:i%9,y:player===0?7-Math.floor(i/9):Math.floor(i/9)}));
 * const salBase=createSalpakanMatch();
 * const salFirst=submitSalpakanSetup(salBase,0,salHome(0),salBase.setupStep);
 * let salReady=acknowledgePass(salFirst,1,salFirst.turn);
 * salReady=submitSalpakanSetup(salReady,1,salHome(1),salReady.setupStep);
 * salReady=acknowledgePass(salReady,0,salReady.turn);
 * const salAction: MoveAction={...legalMovesForCurrentPlayer(salReady,0)[0]!,expectedTurn:salReady.turn};
 * console.log(playSalpakanMove(salReady,0,salAction).phase);
 * ```
 */
export function playSalpakanMove(
  match: ReturnType<typeof createMatch>,
  player: Player,
  action: MoveAction,
) {
  requireMode(match);
  return playMove(match, player, action);
}

function requireMode(match: ReturnType<typeof createMatch>): void {
  if (match.mode !== "salpakan") throw new RangeError("This match uses a different Gunjin mode");
}
