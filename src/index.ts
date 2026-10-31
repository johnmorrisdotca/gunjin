/** SVG board rendering and its optional visual settings. */

export type { DrawOptions } from "./draw.ts";
export { drawGunjinBoard } from "./draw.ts";
export type { GunjinMount, MountOptions } from "./play.ts";
/** Accessible hotseat player and lifecycle handle. */
export { mountGunjin } from "./play.ts";
/** Role-redacted public replay creation and validation. */
export { decodePublicReplay, encodePublicReplay, publicReplay } from "./replay.ts";
export type { Language, Material, PieceStyle } from "./strings.ts";
/** Localized labels, names, and display settings. */
export { modeName, playerName, roleName, STRINGS, words } from "./strings.ts";
/** Scoped family-compatible styles. */
export { GUNJIN_STYLE } from "./style.ts";
/** Core coordinate, action, outcome, and public-view contracts. */
export type {
  Coordinate,
  GameMode,
  MatchResult,
  MoveAction,
  Player,
  PlayerView,
  PublicPosition,
  PublicReplay,
  ViewedPiece,
} from "./types.ts";
/** Redacted player/observer views and legal destination helpers. */
export { boardFeatures, legalMovesForCurrentPlayer, publicPosition, viewForPlayer } from "./views.ts";
