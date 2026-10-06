import type { GameMode, Player } from "./types.ts";

/** Supported interface locales. */
export type Language = "en" | "ja";
/** Board palettes shared with the game family. */
export type Material = "ivory" | "wood" | "slate";
/** Available piece silhouettes. */
export type PieceStyle = "ink" | "tiles";

/** English and Japanese interface labels used by the renderer and player. */
export const STRINGS = {
  en: {
    title: "Gunjin",
    pass: "Pass the device to the named player, then continue.",
    setup: "Place every piece in your home area, then submit your side.",
    turn: "Move one piece. Opponent ranks stay hidden.",
    captureFlagTurn: "Choose a move. Ranks are revealed when pieces battle.",
    battleHistory: "Recent battles",
    battle: "Battle",
    selectPiece: "Choose one of your pieces.",
    selectTarget: "Choose a highlighted destination.",
    invalidSetup: "That setup does not meet this mode's placement rules.",
    stale: "That action is out of date. Reload the current position.",
    undoSetup: "Remove last piece",
    submitSetup: "Finish setup",
    passButton: "Pass device",
    undoPass: "New match",
    offerDraw: "Offer draw",
    acceptDraw: "Accept draw",
    declineDraw: "Decline draw",
    resign: "Resign",
    newMatch: "New match",
    saveReplay: "Save public replay",
    settings: "Settings",
    material: "Board material",
    pieceStyle: "Piece style",
    mode: "Game",
    boardSize: "Board size",
    status: "Game status",
    board: "Board squares. Use arrow keys to move and Enter or Space to choose.",
    red: "Red",
    blue: "Blue",
    winner: "wins",
    draw: "Draw",
    finishObjective: "The objective piece was captured.",
    finishThreshold: "The capture threshold was reached.",
    finishBlocked: "The opponent has no legal move.",
    finishFlagWon: "The flag was captured.",
    finishFlagHeld: "The flag reached the far row and survived the reply turn.",
    finishRepetition: "The public position repeated three times.",
    finishResigned: "A player resigned.",
    finishAgreed: "The players agreed to a draw.",
    captured: "pieces captured",
    role: "piece",
    opponent: "Opponent piece",
    camp: "Safe camp",
    headquarters: "Headquarters",
    lake: "Lake",
    language: "Language",
    modeNames: {
      "hidden-hasami": "Hidden Hasami",
      "luzhanqi-mini": "Luzhanqi Mini",
      salpakan: "Salpakan Classic",
      "stratego-lite": "Hidden Capture Flag",
      "gunjin-shogi": "Gunjin Shogi · Club Rules",
    },
  },
  ja: {
    title: "軍人",
    pass: "表示されたプレイヤーに端末を渡して続けます。",
    setup: "自陣にすべての駒を置いてから配置を確定します。",
    turn: "駒を一つ動かします。相手の階級は表示されません。",
    captureFlagTurn: "駒を動かします。戦闘では両方の階級が公開されます。",
    battleHistory: "最近の戦闘",
    battle: "戦闘",
    selectPiece: "自分の駒を選びます。",
    selectTarget: "色のついた移動先を選びます。",
    invalidSetup: "この配置は、このゲームの配置ルールに合いません。",
    stale: "操作が古くなっています。現在の盤面を読み直してください。",
    undoSetup: "最後の駒を戻す",
    submitSetup: "配置を確定",
    passButton: "端末を渡す",
    undoPass: "新しい対局",
    offerDraw: "引き分けを提案",
    acceptDraw: "引き分けに同意",
    declineDraw: "提案を断る",
    resign: "投了",
    newMatch: "新しい対局",
    saveReplay: "公開棋譜を保存",
    settings: "設定",
    material: "盤の素材",
    pieceStyle: "駒の形",
    mode: "ゲーム",
    boardSize: "盤の大きさ",
    status: "対局状況",
    board: "盤のマスです。矢印キーで移動し、Enter または Space で選びます。",
    red: "赤",
    blue: "青",
    winner: "の勝ち",
    draw: "引き分け",
    finishObjective: "目標の駒が取られました。",
    finishThreshold: "駒の数の条件を満たしました。",
    finishBlocked: "相手に合法手がありません。",
    finishFlagWon: "旗が取られました。",
    finishFlagHeld: "旗が敵陣の端まで進み、相手の応手を生き残りました。",
    finishRepetition: "公開盤面が三回同じになりました。",
    finishResigned: "投了しました。",
    finishAgreed: "両者が引き分けに同意しました。",
    captured: "枚を取りました",
    role: "駒",
    opponent: "相手の駒",
    camp: "安全地帯",
    headquarters: "司令部",
    lake: "湖",
    language: "言語",
    modeNames: {
      "hidden-hasami": "隠し挟み将棋",
      "luzhanqi-mini": "陸戦棋ミニ",
      salpakan: "サルパカン・クラシック",
      "stratego-lite": "隠し旗取り",
      "gunjin-shogi": "軍人将棋・将棋部ルール",
    },
  },
} as const;

/** Returns the localized interface string table. */
export function words(language: Language = "en") {
  return STRINGS[language];
}

/** Returns the localized name for one side. */
export function playerName(language: Language, player: Player): string {
  return words(language)[player === 0 ? "red" : "blue"];
}

/** Returns the localized display name for a ruleset. */
export function modeName(language: Language, mode: GameMode): string {
  return words(language).modeNames[mode];
}

/** Returns a localized piece label, with a readable fallback for unknown roles. */
export function roleName(language: Language, role: string): string {
  if (language === "ja") {
    const ja: Record<string, string> = {
      leader: "指揮官", guard: "護衛", commander: "司令官", officer: "将校",
      soldier: "兵士", engineer: "工兵", bomb: "爆弾", mine: "地雷", flag: "旗",
      "five-star": "五つ星", "four-star": "四つ星", "three-star": "三つ星",
      "two-star": "二つ星", "one-star": "一つ星", colonel: "大佐",
      "lieutenant-colonel": "中佐", major: "少佐", captain: "大尉",
      "first-lieutenant": "中尉", "second-lieutenant": "少尉", sergeant: "軍曹",
      private: "兵", spy: "スパイ",
      marshal: "元帥", general: "大将", miner: "工兵",
      lieutenant: "中尉", "lieutenant-general": "中将", "major-general": "少将",
      aircraft: "飛行機", tank: "戦車", cavalry: "騎兵",
    };
    return ja[role] ?? role;
  }
  const names: Record<string, string> = {
    marshal: "Marshal", general: "General", miner: "Miner", bomb: "Bomb",
    "lieutenant-general": "Lieutenant General", "major-general": "Major General",
    "lieutenant-colonel": "Lieutenant Colonel", "second-lieutenant": "Second Lieutenant",
    aircraft: "Aircraft", tank: "Tank", cavalry: "Cavalry",
  };
  if (names[role]) return names[role];
  return role.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}
