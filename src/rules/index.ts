import type { GameMode } from "../types.ts";
import { HIDDEN_HASAMI_RULES } from "./hiddenHasami.ts";
import { LUZHANQI_MINI_RULES } from "./luzhanqiMini.ts";
import { SALPAKAN_RULES } from "./salpakan.ts";
import type { ModeRules } from "./types.ts";

export const MODE_RULES: Readonly<Record<GameMode, ModeRules>> = {
  "hidden-hasami": HIDDEN_HASAMI_RULES,
  "luzhanqi-mini": LUZHANQI_MINI_RULES,
  salpakan: SALPAKAN_RULES,
};

export type { ModeRules, MoveResolution, SetupPiece } from "./types.ts";
