/** Shared immutable match lifecycle for the club ruleset. */
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
export { GUNJIN_SHOGI_RULES, gunjinCombat } from "./rules/gunjinShogi.ts";
