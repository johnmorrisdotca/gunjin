/** Shared immutable match lifecycle for the Capture Flag ruleset. */
/** Ending a match without a capture: resign, or offer, accept and decline a draw. They take any mode's match. */
export {
  acceptDraw,
  acknowledgePass,
  createMatch,
  declineDraw,
  offerDraw,
  playMove,
  resignMatch,
  rosterForSetup,
  submitSetup,
} from "./match.ts";
/** Complete rule callbacks and supported board dimensions. */
/** Pure attacker/defender/both battle outcome lookup. */
export { STRATEGO_LITE_RULES, strategoCombat } from "./rules/strategoLite.ts";
