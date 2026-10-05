import { createMatch, playMove, submitSetup } from "./match.ts";
import { HIDDEN_HASAMI_RULES } from "./rules/hiddenHasami.ts";
import type { MoveAction, Player, SetupSize } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Makes a Hasami-inspired match with a 7×7 or 9×9 board. */
export function createHasamiMatch(size: SetupSize = {}): ReturnType<typeof createMatch> {
  return createMatch("hidden-hasami", size);
}

/** Submits one player's complete setup; the expected step rejects stale submissions. */
export function submitHasamiSetup(
  match: ReturnType<typeof createMatch>,
  player: Player,
  placements: readonly SetupPiece[],
  expectedSetupStep: number,
) {
  requireMode(match, "hidden-hasami");
  return submitSetup(match, player, placements, expectedSetupStep);
}

/** Applies a legal move action to a Hasami match, rejecting stale turns. */
export function playHasamiMove(
  match: ReturnType<typeof createMatch>,
  player: Player,
  action: MoveAction,
) {
  requireMode(match, "hidden-hasami");
  return playMove(match, player, action);
}

/** Returns the ordered private setup roster for the selected square board size. */
export function hasamiRoster(size: 7 | 9): readonly string[] {
  return HIDDEN_HASAMI_RULES.roster(0, size, size);
}

function requireMode(match: ReturnType<typeof createMatch>, mode: string): void {
  if (match.mode !== mode) throw new RangeError("This match uses a different Gunjin mode");
}
