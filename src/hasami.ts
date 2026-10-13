import { createMatch, playMove, submitSetup } from "./match.ts";
import { HIDDEN_HASAMI_RULES } from "./rules/hiddenHasami.ts";
import type { MoveAction, Player, SetupSize } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Makes a Hasami-inspired match with a 7×7 or 9×9 board.
 *
 * @param size - A supported board size; Hasami accepts 7 or 9 square holes per side.
 * @returns Makes a Hasami-inspired match with a 7×7 or 9×9 board.
 * @example
 * ```ts
 * import { createHasamiMatch } from "@johnmorrisdotca/gunjin/hasami";
 *
 * console.log(createHasamiMatch({width:7,height:7}).phase);
 * ```
 */
export function createHasamiMatch(size: SetupSize = {}): ReturnType<typeof createMatch> {
  return createMatch("hidden-hasami", size);
}

/** Submits one player's complete setup; the expected step rejects stale submissions.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param placements - A complete native roster placed in this mode’s allowed home cells.
 * @param expectedSetupStep - The setup step seen by the caller, used to reject stale submissions.
 * @returns Submits one player's complete setup; the expected step rejects stale submissions.
 * @example
 * ```ts
 * import type { Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
 *
 * const home=(player: Player)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
 * const base=createHasamiMatch({width:7,height:7});
 * console.log(submitHasamiSetup(base,0,home(0),base.setupStep).phase);
 * ```
 */
export function submitHasamiSetup(
  match: ReturnType<typeof createMatch>,
  player: Player,
  placements: readonly SetupPiece[],
  expectedSetupStep: number,
) {
  requireMode(match, "hidden-hasami");
  return submitSetup(match, player, placements, expectedSetupStep);
}

/** Applies a legal move action to a Hasami match, rejecting stale turns.
 *
 * @param match - The full authoritative match, held by a trusted host or the local hotseat owner.
 * @param player - The acting player, 0 or 1; the lifecycle checks that this is the expected player.
 * @param action - Native source/destination coordinates and the caller’s expected turn.
 * @returns Applies a legal move action to a Hasami match, rejecting stale turns.
 * @example
 * ```ts
 * import type { MoveAction, Player } from "@johnmorrisdotca/gunjin";
 * import { createHasamiMatch, hasamiRoster, playHasamiMove, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
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
 * console.log(playHasamiMove(ready,0,action).phase);
 * ```
 */
export function playHasamiMove(
  match: ReturnType<typeof createMatch>,
  player: Player,
  action: MoveAction,
) {
  requireMode(match, "hidden-hasami");
  return playMove(match, player, action);
}

/** Returns the ordered private setup roster for the selected square board size.
 *
 * @param size - A supported board size; Hasami accepts 7 or 9 square holes per side.
 * @returns Returns the ordered private setup roster for the selected square board size.
 * @example
 * ```ts
 * import { hasamiRoster } from "@johnmorrisdotca/gunjin/hasami";
 *
 * console.log(hasamiRoster(7));
 * ```
 */
export function hasamiRoster(size: 7 | 9): readonly string[] {
  return HIDDEN_HASAMI_RULES.roster(0, size, size);
}

function requireMode(match: ReturnType<typeof createMatch>, mode: string): void {
  if (match.mode !== mode) throw new RangeError("This match uses a different Gunjin mode");
}
