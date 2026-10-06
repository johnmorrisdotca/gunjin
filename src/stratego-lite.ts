/** Shared immutable match lifecycle for the Capture Flag ruleset. */
export { createMatch, rosterForSetup, submitSetup, acknowledgePass, playMove } from "./match.ts";
/** Ending a match without a capture: resign, or offer, accept and decline a draw. They take any mode's match. */
export { acceptDraw, declineDraw, offerDraw, resignMatch } from "./match.ts";
/** Complete rule callbacks and supported board dimensions. */
export { STRATEGO_LITE_RULES } from "./rules/strategoLite.ts";
/** Pure attacker/defender/both battle outcome lookup. */
export { strategoCombat } from "./rules/strategoLite.ts";
