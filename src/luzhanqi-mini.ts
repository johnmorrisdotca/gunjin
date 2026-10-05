import { createMatch, playMove, submitSetup } from "./match.ts";
import { LUZHANQI_MINI_RULES } from "./rules/luzhanqiMini.ts";
import type { MoveAction, Player } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Makes the fixed 7×8 streamlined land-battle training game. */
export function createLuzhanqiMiniMatch() {
  return createMatch("luzhanqi-mini");
}

/** Returns the ordered 14-piece setup roster for one side. */
export function luzhanqiMiniRoster(): readonly string[] {
  return LUZHANQI_MINI_RULES.roster(0, 7, 8);
}

/** Submits a complete side setup and advances the hotseat setup phase. */
export function submitLuzhanqiMiniSetup(
  match: ReturnType<typeof createMatch>,
  player: Player,
  placements: readonly SetupPiece[],
  expectedSetupStep: number,
) {
  requireMode(match);
  return submitSetup(match, player, placements, expectedSetupStep);
}

/** Applies a legal move action, rejecting stale turn numbers. */
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
