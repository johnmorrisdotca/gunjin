import { createMatch, playMove, submitSetup } from "./match.ts";
import { LUZHANQI_MINI_RULES } from "./rules/luzhanqiMini.ts";
import type { MoveAction, Player } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Makes the fixed 7×8 streamlined land-battle training game. */
export function createLuzhanqiMiniMatch() {
  return createMatch("luzhanqi-mini");
}

export function luzhanqiMiniRoster(): readonly string[] {
  return LUZHANQI_MINI_RULES.roster(0, 7, 8);
}

export function submitLuzhanqiMiniSetup(
  match: ReturnType<typeof createMatch>,
  player: Player,
  placements: readonly SetupPiece[],
  expectedSetupStep: number,
) {
  requireMode(match);
  return submitSetup(match, player, placements, expectedSetupStep);
}

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
