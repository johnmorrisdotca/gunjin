import { createMatch, playMove, submitSetup } from "./match.ts";
import { SALPAKAN_RULES } from "./rules/salpakan.ts";
import type { MoveAction, Player } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Makes the fixed classic 9×8 Salpakan match. */
export function createSalpakanMatch() {
  return createMatch("salpakan");
}

/** Returns the ordered 21-piece setup roster for one side. */
export function salpakanRoster(): readonly string[] {
  return SALPAKAN_RULES.roster(0, 9, 8);
}

/** Submits a complete side setup and advances the hotseat setup phase. */
export function submitSalpakanSetup(
  match: ReturnType<typeof createMatch>,
  player: Player,
  placements: readonly SetupPiece[],
  expectedSetupStep: number,
) {
  requireMode(match);
  return submitSetup(match, player, placements, expectedSetupStep);
}

/** Applies a legal move action, rejecting stale turn numbers. */
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
