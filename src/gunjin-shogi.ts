/** Shared immutable match lifecycle for the club ruleset. */
export { createMatch, rosterForSetup, submitSetup, acknowledgePass, playMove } from "./match.ts";
/** Complete rule callbacks and supported board dimensions. */
export { GUNJIN_SHOGI_RULES, gunjinCombat } from "./rules/gunjinShogi.ts";
