import { createHasamiMatch } from "./dist/hasami.js";
import { createLuzhanqiMiniMatch } from "./dist/luzhanqi-mini.js";
import { createSalpakanMatch } from "./dist/salpakan.js";
import { createMatch as createStrategoLiteMatch } from "./dist/stratego-lite.js";
import { createMatch as createGunjinShogiMatch } from "./dist/gunjin-shogi.js";
import { mountGunjin } from "./dist/play.js";

const controls = {
  mode: document.querySelector("#mode"),
  size: document.querySelector("#size"),
  sizeWrap: document.querySelector("#size-wrap"),
  language: document.querySelector("#language"),
  material: document.querySelector("#material"),
  pieceStyle: document.querySelector("#piece-style"),
  new: document.querySelector("#new"),
};
const host = document.querySelector("#player");
const notice = document.querySelector("#notice");
let mounted;
const pageLanguage = familyLanguage({
  id: "gunjin",
  words: {
      en: { pitch: "Five hidden-rank strategy games for two people sharing one device.", name: "Gunjin (軍人) is Japanese for a soldier, and the first word of Gunjin Shogi, soldier chess.", nameLink: "About the name", pageRules: "Rules", pageApi: "API", foot: "Play together, one device at a time.", family: "Part of the family", licence: "MIT licence", help: "Help", helpTip: "Show explanations for settings.", mode: "Game", boardSize: "Board", language: "Language", material: "Board material", pieceStyle: "Piece style", newMatch: "New game", rules: "Rules", allRules: "Read the full rules", modeHasami: "Hidden Hasami", modeLuzhanqi: "Luzhanqi Mini", modeSalpakan: "Salpakan Classic", modeStratego: "Hidden Capture Flag", modeGunjinShogi: "Gunjin Shogi · Club Rules" },
    ja: { pitch: "一台の端末を二人で使う、階級を隠す五つの対戦ゲームです。", name: "「軍人」は兵士のことで、軍人将棋の最初の言葉です。", nameLink: "名前について", pageRules: "ルール", pageApi: "API", foot: "一台の端末で一緒に遊べます。", family: "ファミリー", licence: "MITライセンス", help: "説明", helpTip: "設定の説明を表示します。", mode: "ゲーム", boardSize: "盤の大きさ", language: "言語", material: "盤の素材", pieceStyle: "駒の形", newMatch: "新しい対局", rules: "ルール", allRules: "ルールを読む", modeHasami: "隠し挟み将棋", modeLuzhanqi: "陸戦棋ミニ", modeSalpakan: "サルパカン・クラシック", modeStratego: "隠し旗取り", modeGunjinShogi: "軍人将棋・将棋部ルール" },
  },
  onChange: language => {
    controls.language.value = language;
    mounted?.set({ language });
  },
});

function makeMatch() {
  if (controls.mode.value === "hidden-hasami") {
    const size = Number(controls.size.value);
    return createHasamiMatch({ width: size, height: size });
  }
  if (controls.mode.value === "luzhanqi-mini") return createLuzhanqiMiniMatch();
  if (controls.mode.value === "salpakan") return createSalpakanMatch();
  if (controls.mode.value === "stratego-lite") return createStrategoLiteMatch("stratego-lite");
  return createGunjinShogiMatch("gunjin-shogi");
}

function start() {
  mounted?.destroy();
  mounted = mountGunjin(host, makeMatch(), {
    language: controls.language.value,
    material: controls.material.value,
    pieceStyle: controls.pieceStyle.value,
    onChange: () => { notice.textContent = ""; },
  });
  notice.textContent = "";
}

function syncControls() {
  const hasami = controls.mode.value === "hidden-hasami";
  controls.sizeWrap.hidden = !hasami;
}

controls.mode.addEventListener("change", syncControls);
controls.new.addEventListener("click", start);
for (const control of [controls.language, controls.material, controls.pieceStyle]) {
  control.addEventListener("change", () => {
    if (control === controls.language) pageLanguage.set(controls.language.value);
    mounted?.set({
    language: controls.language.value,
    material: controls.material.value,
    pieceStyle: controls.pieceStyle.value,
    });
  });
}
controls.language.value = pageLanguage.lang;
syncControls();
start();
