// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and is the same each run: each side's pieces
// are placed by tapping cells in roster order, the way a person does, and every picture is of a state the page reaches that way.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const range = (from, count) => Array.from({ length: count }, (_, at) => from + at);

/**
 * Each game's two setups, as the cells tapped in roster order: the first side takes the bottom rows, the second the top.
 * Luzhanqi Mini's pieces are placed so that its rules hold (mines and bombs on the back row, the flag on a headquarters).
 */
const GAMES = {
  "hidden-hasami-7": { first: range(42, 7), second: range(0, 7) },
  "hidden-hasami-9": { first: range(72, 9), second: range(0, 9) },
  "luzhanqi-mini": { first: [42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53, 54, 55, 50], second: [7, 8, 9, 10, 11, 12, 13, 0, 2, 3, 4, 5, 6, 1] },
  salpakan: { first: range(51, 21), second: range(0, 21) },
  "stratego-lite": { first: range(60, 40), second: range(0, 40) },
  "gunjin-shogi": { first: [...range(45, 30), 75], second: [...range(0, 30), 31] },
};

/** Start a game of a mode (at a size, for Hidden Hasami), and wait for its setup screen. */
async function begin(page, mode, size) {
  await page.getByLabel("Game", { exact: true }).selectOption(mode);
  if (size) await page.locator("#size").selectOption(String(size));
  await page.getByRole("button", { name: /^(New game|新しい対局)$/ }).click();
  await page.waitForSelector(".gj-cell");
}

/** Tap a side's cells in roster order, then give the device on. `handoff` stops at the screen that hides the board. */
async function arrange(page, cells, { handoff = false } = {}) {
  for (const cell of cells) await page.locator(`.gj-cell[data-cell="${cell}"]`).click();
  await page.locator(".gj-primary").first().click();
  if (handoff) {
    await page.waitForSelector(".gj-pass");
    return;
  }
  await page.locator(".gj-pass .gj-primary").click();
}

/** Both sides arranged, the first side to move: the board each opens on. */
async function play(page, mode, size) {
  await begin(page, mode, size);
  const { first, second } = GAMES[size ? `${mode}-${size}` : mode];
  await arrange(page, first);
  await arrange(page, second);
  await page.locator(".gj-status").waitFor();
}

const PLAYING = (subject, mode, extra = {}) => ({
  subject,
  views: ["desk"],
  ready: ".gj-cell",
  target: ".gj-root",
  prepare: (page) => play(page, mode, extra.size),
  ...extra,
});

await takePictures({
  shots: [
    // The page from the top: a 7×7 Hidden Hasami game, the first side to move. On a phone, in Japanese.
    {
      subject: "hero",
      views: ["desk", "phone"],
      height: 1240,
      ready: ".gj-cell",
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto("http://gunjin.test/?lang=ja");
          await page.waitForSelector(".gj-cell");
        }
        await play(page, "hidden-hasami", 7);
        if (view === "phone") await page.locator(".gj-root").evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8));
        else await page.evaluate(() => window.scrollTo(0, 0));
      },
    },
    PLAYING("hasami", "hidden-hasami", { size: 9 }),
    PLAYING("luzhanqi-mini", "luzhanqi-mini"),
    PLAYING("salpakan", "salpakan"),
    PLAYING("capture-flag", "stratego-lite"),
    PLAYING("gunjin-shogi", "gunjin-shogi"),
    // A side's private setup: every piece of Salpakan's roster placed, in the order it is dealt.
    {
      subject: "setup",
      views: ["desk"],
      ready: ".gj-cell",
      target: ".gj-root",
      async prepare(page) {
        await begin(page, "salpakan");
        for (const cell of GAMES.salpakan.first) await page.locator(`.gj-cell[data-cell="${cell}"]`).click();
      },
    },
    // The screen that hides the board while the device changes hands.
    {
      subject: "handoff",
      views: ["phone"],
      ready: ".gj-cell",
      target: ".gj-root",
      async prepare(page) {
        await begin(page, "luzhanqi-mini");
        await arrange(page, GAMES["luzhanqi-mini"].first, { handoff: true });
      },
    },
    // Slate, and tiles instead of discs: the board's looks are options.
    {
      subject: "slate-tiles",
      views: ["desk"],
      ready: ".gj-cell",
      target: ".gj-root",
      async prepare(page) {
        await page.locator("#material").selectOption("slate");
        await page.locator("#piece-style").selectOption("tiles");
        await play(page, "gunjin-shogi");
      },
    },
  ],
});
