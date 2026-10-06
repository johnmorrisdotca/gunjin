<h1 align="center">Gunjin <sub>軍人</sub></h1>

<p align="center"><strong>Five hidden-rank strategy games, played face to face on one device.</strong><br>
A typed, immutable game engine and a private pass-the-device browser player, in English and Japanese.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/gunjin/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/gunjin/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/gunjin"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/gunjin?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No runtime dependencies" src="https://img.shields.io/badge/runtime%20dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/gunjin/"><strong>Play the demo →</strong></a> · <a href="https://johnmorrisdotca.github.io/gunjin/api.html">API reference</a> · <a href="docs/RULES.md">Rules and adaptations</a></p>

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/hero-desk-light.webp" alt="The demo on a desk: Gunjin's header with its language chooser, five cloth patches and the Help switch, the settings row (game, board size, language, board material, piece style and New game), then a 7×7 Hidden Hasami board on green felt with blue's seven plain discs along the top, the line 'Move one piece. Opponent ranks stay hidden.' above it, and red to move" width="600">
</picture>
<br><em>The demo on a desk: a 7×7 Hidden Hasami game, red to move.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/hero-phone-light.webp" alt="The demo on a phone, in Japanese: the same Hidden Hasami board with red's leader (L) and six guards (G) along the bottom, blue's pieces as plain discs along the top, and the Offer draw, Resign and Save public replay buttons under it, in Japanese" width="190">
</picture>
<br><em>On a phone, in Japanese, in the device's light or dark.</em>
</td>
</tr>
</table>

Gunjin brings five hidden-rank strategy games together behind one small API:
Hidden Hasami, Luzhanqi Mini, Salpakan Classic, Hidden Capture Flag, and
Gunjin Shogi · Club Rules. The rules and adaptations are documented in
[Rules](docs/RULES.md); each mode is named plainly where it differs from a
traditional ruleset.

In every one of them, each player's pieces carry ranks that the other cannot see.
Two people share one screen, so the screen has to keep a secret: a side arranges its
pieces in private, the board is covered while the device changes hands, and what is drawn
for a player, handed to a spectator or saved in a replay never carries a rank the rules
keep from the other side. The engine is a set of pure functions that return new matches; the
browser player is one call.

## In 30 seconds

```sh
npm install @johnmorrisdotca/gunjin
```

```ts
import { createHasamiMatch, hasamiRoster } from "@johnmorrisdotca/gunjin/hasami";
import { viewForPlayer } from "@johnmorrisdotca/gunjin/views";

const match = createHasamiMatch({ width: 7, height: 7 });
console.log(hasamiRoster(7)); // one leader and six guards
console.log(viewForPlayer(match, 0).phase); // "setup"
```

A complete setup is submitted through the mode's entry point, one
player at a time. The browser player takes an authoritative match and handles
private setup, device handoff, play, and public replay download:

```ts no-run
import { createHasamiMatch } from "@johnmorrisdotca/gunjin/hasami";
import { mountGunjin } from "@johnmorrisdotca/gunjin/play";

const match = createHasamiMatch({ width: 7, height: 7 });
const game = mountGunjin(document.querySelector<HTMLElement>("#game")!, match, {
  language: "en",
  material: "wood",
  pieceStyle: "tiles",
});
// Call game.destroy() when the page removes the game.
```

The container should have a width and a positioned layout. For a working
match, each side must submit a valid roster before play begins. The
[demo](https://johnmorrisdotca.github.io/gunjin/) shows the full flow.

## Who it is for

- **Board-game projects** that need rules and validation separate from the UI.
- **Local game nights** that want a private setup and handoff on one screen.
- **Teachers and clubs** comparing five related hidden-rank rule adaptations.
- **Web developers** who want an SVG renderer or a small typed engine without
  adopting a UI framework.

## Features

- **Five hidden-rank games**, each a typed, immutable engine: Hidden Hasami, Luzhanqi Mini, Salpakan Classic, Hidden Capture Flag and Gunjin Shogi · Club Rules, each named plainly where it adapts a traditional ruleset.
- **Play locally.** Two people arrange their pieces privately and pass one
  device between turns. Opposing ranks stay hidden in the player view.
- **Build your own interface.** Pure functions create matches, validate
  setups and moves, and produce redacted views and public replays.
- **Choose a look.** The browser player supports English or Japanese, three
  board materials, and two piece styles.
- **Role-safe by design.** Views, public positions and replay records never carry a hidden rank that the rules keep from the other side; the full match is for trusted host code only.
- **Use it anywhere.** Typed ES modules, no runtime dependencies, and no
  framework requirement.
- **Playable from the keyboard.** Every cell is a button; the arrow keys move between cells, and Enter or Space chooses. See [Accessibility](#accessibility).
- **Stale input is refused.** A setup, a move or a handoff names the step or turn it was made for, so a repeated or late request cannot be applied twice.

### What's in it

Each picture is a real game, drawn by the package, taken from [the demo](https://johnmorrisdotca.github.io/gunjin/) with `pnpm screenshots:readme`, in light and dark. Red (the first side) sees its own ranks; the other side's pieces are plain discs.

<table>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/hasami-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/hasami-desk-light.webp" alt="A 9×9 Hidden Hasami board on green felt: red's leader (L) and eight guards (G) along the bottom row, blue's nine plain discs along the top row, and the buttons Offer draw, Resign and Save public replay under it" width="300">
</picture>
<br><em><strong>Hidden Hasami.</strong> One leader and guards that all move alike, hidden from the other side; 7×7 or 9×9. Capture the leader to win.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/luzhanqi-mini-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/luzhanqi-mini-desk-light.webp" alt="A 7×8 Luzhanqi Mini board: red's fourteen pieces in the two bottom rows with their letters (C, O, S, E, B, M, F) and blue's as plain discs at the top, with two headquarters on each back row and two green safe camps in the middle" width="300">
</picture>
<br><em><strong>Luzhanqi Mini.</strong> A small railway-free board with headquarters and safe camps, bombs and mines. Capture the flag.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/salpakan-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/salpakan-desk-light.webp" alt="A 9×8 Salpakan Classic board: red's 21 pieces in three rows with ranks such as 5★, Co, Maj, P for private and F for the flag, and blue's 21 pieces as plain discs" width="300">
</picture>
<br><em><strong>Salpakan Classic.</strong> Twenty-one ranked pieces, from five stars down to privates, spies and a flag.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/capture-flag-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/capture-flag-desk-light.webp" alt="A 10×10 Hidden Capture Flag board: red's forty pieces in four rows labelled Ma, Ge, Co, Maj, Cap, Lt, Sgt, Mi, Sc, B and F, blue's forty as plain discs in the four rows opposite" width="300">
</picture>
<br><em><strong>Hidden Capture Flag.</strong> The forty-piece original roster on a 10×10 board. A fight reveals both ranks, to both sides.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/gunjin-shogi-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/gunjin-shogi-desk-light.webp" alt="A 9×9 Gunjin Shogi board: red's thirty-one pieces labelled Ge, LGen, MGen, Co, LtC, Maj, Cap, Lt, 2L, Air, T, Cav, E, M and F in four rows, with a headquarters square on each back row, and blue's pieces as plain discs" width="300">
</picture>
<br><em><strong>Gunjin Shogi · Club Rules.</strong> Thirty-one pieces with aircraft, tanks, engineers and mines, and four headquarters.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/setup-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/setup-desk-light.webp" alt="The private setup of Salpakan Classic: all twenty-one of red's pieces placed in the bottom three rows in the order they are dealt, the counter 21 / 21, and the buttons Remove last piece and Finish setup" width="300">
</picture>
<br><em><strong>A private setup.</strong> A side taps its pieces onto its home rows, one at a time in the order they are dealt, and removes the last one if it slips.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/handoff-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/handoff-phone-light.webp" alt="The handoff screen on a phone: a white panel that says Blue, asks to pass the device to the named player, and has one Pass device button, with the board hidden" width="300">
</picture>
<br><em><strong>The handoff.</strong> The board is covered while the device changes hands, and only the named player can uncover it.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/slate-tiles-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/gunjin/main/docs/images/slate-tiles-desk-light.webp" alt="A 9×9 Gunjin Shogi board on the slate material with square tile pieces: red's pieces labelled with their ranks and blue's as plain white-centred tiles" width="300">
</picture>
<br><em><strong>Looks.</strong> Three board materials (ivory, wood, slate) and two piece styles (ink discs and tiles), changed at any time.</em>
</td>
</tr>
</table>

## Use it in your project

Gunjin is two things, each usable without the other: **the engine** (matches, setups, moves, views and replays, as pure functions over plain values) and **the player** (an SVG board and a pass-the-device screen, in one call). The table under [API](#entry-points) says which entry holds which.

### Install

```sh
npm install @johnmorrisdotca/gunjin
# or: pnpm add @johnmorrisdotca/gunjin
# or: yarn add @johnmorrisdotca/gunjin
```

It is ES modules only, with its types included, and needs Node 22 or later when it runs outside a browser. There is no custom element: the player is `mountGunjin`, called from your own script.

### 1. The engine on a server

Every function takes a match and returns a new one; none changes what it was given. Keep the full match, which holds both sides' ranks, in code you trust, and send each player only their own view.

```ts
import { createHasamiMatch } from "@johnmorrisdotca/gunjin/hasami";
import { viewForPlayer } from "@johnmorrisdotca/gunjin/views";

const match = createHasamiMatch({ width: 9, height: 9 });   // an authoritative match: both sides' pieces, when there are some
const forRed = viewForPlayer(match, 0);                      // what red may see
console.log(forRed.phase, forRed.width, forRed.height);      // setup 9 9
```

### 2. The player in a page

```html
<div id="game"></div>
<script type="module">
  import { createMatch } from "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/gunjin@0/dist/gunjin-shogi.js";
  import { mountGunjin } from "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/gunjin@0/dist/play.js";

  mountGunjin(document.getElementById("game"), createMatch("gunjin-shogi"), { language: "en" });
</script>
```

With a bundler, the same two imports are `@johnmorrisdotca/gunjin/gunjin-shogi` and `@johnmorrisdotca/gunjin/play`. The player draws into the element you give it, in that page's own DOM, with its styles scoped under `.gj-root`.

### 3. Anything else

Draw a board from a view with `drawGunjinBoard` and build your own screens, or run the engine in a worker, a test or a server. The recipes are under [Examples](#examples).

## Examples

Each example is a whole recipe: copy it, and it works. They are run, in CI, against the built package, so none of them is a guess (`pnpm test:readme`). Output, where there is some, is shown under the example.

### A whole match, from setup to the first move

A match goes through four phases: `setup` (a side arranges its pieces in private), `pass` (the board is hidden while the device changes hands), `play`, and `finished`. The mode's own entry creates the match, deals the roster, takes a setup and applies a move. `acknowledgePass` is the same for every mode, and is exported by `/gunjin-shogi` and `/stratego-lite`.

```ts
import { createHasamiMatch, hasamiRoster, playHasamiMove, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
import { legalMovesForCurrentPlayer, viewForPlayer } from "@johnmorrisdotca/gunjin/views";

const roster = hasamiRoster(7);                                     // dealt in this order: one leader, then six guards
const homeRow = (player: 0 | 1) => roster.map((kind, x) => ({ kind, x, y: player === 0 ? 6 : 0 }));

let match = createHasamiMatch({ width: 7, height: 7 });
match = submitHasamiSetup(match, 0, homeRow(0), match.setupStep);   // red arranges its pieces, in private
console.log(match.phase, viewForPlayer(match, 0).pieces);           // the board is hidden while the device changes hands
match = acknowledgePass(match, 1, match.turn);                      // blue has the device
match = submitHasamiSetup(match, 1, homeRow(1), match.setupStep);
match = acknowledgePass(match, 0, match.turn);                      // red again: play begins
console.log(match.phase, match.currentPlayer, legalMovesForCurrentPlayer(match, 0).length);

match = playHasamiMove(match, 0, { from: { x: 0, y: 6 }, to: { x: 0, y: 5 }, expectedTurn: match.turn });
console.log(match.phase, match.currentPlayer);                      // the device goes to blue
```

```text
pass null
play 0 35
pass 1
```

### What each side may see

A player's view keeps the player's own pieces with their roles and shows the other side's as plain pieces with no role and no id. A spectator's position has no roles at all.

```ts
import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
import { publicPosition, viewForPlayer } from "@johnmorrisdotca/gunjin/views";

const roster = hasamiRoster(7);
const homeRow = (player: 0 | 1) => roster.map((kind, x) => ({ kind, x, y: player === 0 ? 6 : 0 }));
let match = createHasamiMatch({ width: 7, height: 7 });
match = submitHasamiSetup(match, 0, homeRow(0), match.setupStep);
match = acknowledgePass(match, 1, match.turn);
match = submitHasamiSetup(match, 1, homeRow(1), match.setupStep);
match = acknowledgePass(match, 0, match.turn);

const red = viewForPlayer(match, 0).pieces!;
console.log(red.find((piece) => piece.owner === 0 && piece.x === 0)?.kind);  // leader: red knows its own pieces
console.log(red.find((piece) => piece.owner === 1 && piece.x === 0));        // { owner: 1, x: 0, y: 0, kind: null, hidden: true }
console.log(publicPosition(match).pieces![0]);                               // { owner: 0, x: 0, y: 6, hidden: true }: no role at all
```

### A move that is late is refused

A move names the turn it was made for, so a request that arrives twice, or after the other side has moved, does not change the match. The same goes for a setup (`expectedSetupStep`) and a handoff.

```ts
import { createHasamiMatch, hasamiRoster, playHasamiMove, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";

const roster = hasamiRoster(7);
const homeRow = (player: 0 | 1) => roster.map((kind, x) => ({ kind, x, y: player === 0 ? 6 : 0 }));
let match = createHasamiMatch({ width: 7, height: 7 });
match = submitHasamiSetup(match, 0, homeRow(0), match.setupStep);
match = acknowledgePass(match, 1, match.turn);
match = submitHasamiSetup(match, 1, homeRow(1), match.setupStep);
match = acknowledgePass(match, 0, match.turn);

const move = { from: { x: 0, y: 6 }, to: { x: 0, y: 5 }, expectedTurn: match.turn };
const after = playHasamiMove(match, 0, move);
try {
  playHasamiMove(after, 0, move);                        // the same request again, a turn late
} catch (error) {
  console.log(error instanceof RangeError);              // true: nothing was changed
}
console.log(match.turn, after.turn);                     // the first match is untouched: every call returns a new one
```

### End a match by resigning or by agreement

A match need not end on the board. The side to move may resign, which is public and gives the match to the other side, or offer a draw. An offer passes the device to the other side, behind the cover like any handoff, and that side accepts it, declines it or simply moves, which declines it. Every call names the turn it was made for, and a call by the wrong side, for a stale turn or outside play throws a `RangeError` and changes nothing. The four calls take a match of any mode and are exported by `/gunjin-shogi` and `/stratego-lite`.

```ts
import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acceptDraw, acknowledgePass, declineDraw, offerDraw, resignMatch } from "@johnmorrisdotca/gunjin/gunjin-shogi";

const roster = hasamiRoster(7);
const homeRow = (player: 0 | 1) => roster.map((kind, x) => ({ kind, x, y: player === 0 ? 6 : 0 }));
let match = createHasamiMatch({ width: 7, height: 7 });
match = submitHasamiSetup(match, 0, homeRow(0), match.setupStep);
match = acknowledgePass(match, 1, match.turn);
match = submitHasamiSetup(match, 1, homeRow(1), match.setupStep);
match = acknowledgePass(match, 0, match.turn);                      // red to move

let offered = offerDraw(match, 0, match.turn);                      // red offers a draw
console.log(offered.phase, offered.currentPlayer, offered.drawOffer);
let asked = acknowledgePass(offered, 1, offered.turn);              // blue has the device and sees the offer
asked = declineDraw(asked, 1, asked.turn);                          // blue declines, and still has the move
console.log(asked.phase, asked.currentPlayer, asked.drawOffer);

offered = offerDraw(match, 0, match.turn);
const drawn = acceptDraw(acknowledgePass(offered, 1, offered.turn), 1, offered.turn);
console.log(drawn.phase, drawn.result);                             // agreed: no winner

const resigned = resignMatch(match, 0, match.turn);                 // red resigns instead
console.log(resigned.phase, resigned.result);
```

```text
pass 1 0
play 1 undefined
finished { winner: null, reason: 'agreed-draw' }
finished { winner: 1, reason: 'resigned' }
```

### Save the game for a host, and for everybody

Two records are kept, and they are not alike. The **trusted** record holds both sides' ranks, and is only for the code that runs the match. The **public replay** holds no rank the rules keep hidden, and can be shown to anybody; it cannot resume a match.

```ts
import { createHasamiMatch, hasamiRoster, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { decodeTrustedMatch, encodeTrustedMatch } from "@johnmorrisdotca/gunjin/trusted";
import { decodePublicReplay, encodePublicReplay } from "@johnmorrisdotca/gunjin";

const roster = hasamiRoster(9);
let match = createHasamiMatch({ width: 9, height: 9 });
match = submitHasamiSetup(match, 0, roster.map((kind, x) => ({ kind, x, y: 8 })), match.setupStep);

const kept = encodeTrustedMatch(match);                    // JSON with every role in it: a database column on the host, never a browser
console.log(JSON.stringify(decodeTrustedMatch(kept)) === JSON.stringify(match)); // true

const shared = encodePublicReplay(match);                  // JSON with no roles: safe to hand to anybody
console.log(shared.includes("leader"), decodePublicReplay(shared)?.mode);        // false hidden-hasami
console.log(decodePublicReplay("not a replay"));           // null: a record that is not a replay is refused, never half read
```

### The five games, side by side

Every mode makes a match the same way, and the generic calls (`createMatch(mode)`, `rosterForSetup(match, player)`) take any of them.

```ts
import { createMatch, rosterForSetup } from "@johnmorrisdotca/gunjin/gunjin-shogi";
import { modeName } from "@johnmorrisdotca/gunjin";

for (const mode of ["hidden-hasami", "luzhanqi-mini", "salpakan", "stratego-lite", "gunjin-shogi"] as const) {
  const match = createMatch(mode);
  console.log(`${modeName("en", mode).padEnd(26)} ${match.width}×${match.height}  ${rosterForSetup(match, 0).length} pieces a side`);
}
```

```text
Hidden Hasami              9×9  9 pieces a side
Luzhanqi Mini              7×8  14 pieces a side
Salpakan Classic           9×8  21 pieces a side
Hidden Capture Flag        10×10  40 pieces a side
Gunjin Shogi · Club Rules  9×9  31 pieces a side
```

### Who wins a fight

Capture Flag and Gunjin Shogi each export their battle table as a pure function: the attacker's rank, the defender's, and who is removed (`"attacker"`, `"defender"` or `"both"`).

```ts
import { strategoCombat } from "@johnmorrisdotca/gunjin/stratego-lite";
import { gunjinCombat } from "@johnmorrisdotca/gunjin/gunjin-shogi";

console.log(strategoCombat("spy", "marshal"));      // attacker: a spy defeats a marshal, but only when it attacks
console.log(strategoCombat("scout", "bomb"));       // defender: a bomb defeats every attacker except a miner
console.log(strategoCombat("miner", "bomb"));       // attacker
console.log(gunjinCombat("engineer", "mine"));      // attacker: an engineer clears a mine
console.log(gunjinCombat("aircraft", "tank"));      // attacker
console.log(gunjinCombat("colonel", "colonel"));    // both: equal pieces remove each other
```

### Draw a board as SVG text

`drawGunjinBoard` takes a player's view and returns SVG text, so a board can go in a page, a file, an email or a test. It only ever draws a redacted view: an enemy piece is a disc with no role in it.

```ts
import { drawGunjinBoard } from "@johnmorrisdotca/gunjin/draw";
import { createHasamiMatch } from "@johnmorrisdotca/gunjin/hasami";
import { viewForPlayer } from "@johnmorrisdotca/gunjin/views";

const view = viewForPlayer(createHasamiMatch({ width: 7, height: 7 }), 0);
const svg = drawGunjinBoard(view, { material: "slate", pieceStyle: "tiles", language: "ja" });
console.log(svg.startsWith("<svg"), svg.includes('role="img"'));    // true true
```

Written to a file, it is a picture anyone can open:

```js
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { drawGunjinBoard } from "@johnmorrisdotca/gunjin/draw";
import { createMatch } from "@johnmorrisdotca/gunjin/gunjin-shogi";
import { viewForPlayer } from "@johnmorrisdotca/gunjin/views";

const view = viewForPlayer(createMatch("luzhanqi-mini"), 0);
const file = join(tmpdir(), "gunjin-luzhanqi-mini.svg");
writeFileSync(file, drawGunjinBoard(view, { material: "wood" }));
console.log("wrote", file.endsWith(".svg"));
```

### Where the camps and headquarters are

Three modes mark squares on the board: Luzhanqi Mini has camps and headquarters, Gunjin Shogi has headquarters, and Hidden Capture Flag has two 2×2 lakes that no piece may enter or cross. They are public, so `boardFeatures` needs no match, and `drawGunjinBoard` and the player draw them for you.

```ts
import { boardFeatures } from "@johnmorrisdotca/gunjin/views";

const luzhanqi = boardFeatures("luzhanqi-mini", 7, 8);
console.log(luzhanqi.camps.length, luzhanqi.headquarters.length);   // 4 4
console.log(boardFeatures("gunjin-shogi", 9, 9).headquarters);      // four headquarters, two on each back row
console.log(boardFeatures("stratego-lite", 10, 10).lakes.length);   // 8 squares: two lakes of four
console.log(boardFeatures("salpakan", 9, 8));                       // { camps: [], headquarters: [], lakes: [] }
```

### A host that keeps the secret

This is the shape of a server route or a worker that runs matches for two devices: it keeps the trusted record, applies each request through the engine, and answers with the one player's own view. After a move the board stays covered, for both sides, until the other player says the device has arrived.

```ts
import { createHasamiMatch, hasamiRoster, playHasamiMove, submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
import { decodeTrustedMatch, encodeTrustedMatch } from "@johnmorrisdotca/gunjin/trusted";
import { viewForPlayer } from "@johnmorrisdotca/gunjin/views";
import type { MoveAction, Player, PlayerView } from "@johnmorrisdotca/gunjin";

type Answer = { record: string; view: PlayerView };

/** A move: read the record, apply it (this throws on a stale turn or an illegal move), keep the new record, answer with the mover's view. */
function handleMove(record: string, player: Player, action: MoveAction): Answer {
  const match = decodeTrustedMatch(record);
  if (match === null) throw new Error("the record is not a match");
  const next = playHasamiMove(match, player, action);
  return { record: encodeTrustedMatch(next), view: viewForPlayer(next, player) };
}

/** The other player has the device: uncover the board for them, and only for them. */
function handleReady(record: string, player: Player): Answer {
  const match = decodeTrustedMatch(record);
  if (match === null) throw new Error("the record is not a match");
  const next = acknowledgePass(match, player, match.turn);
  return { record: encodeTrustedMatch(next), view: viewForPlayer(next, player) };
}

const roster = hasamiRoster(7);
const homeRow = (player: 0 | 1) => roster.map((kind, x) => ({ kind, x, y: player === 0 ? 6 : 0 }));
let match = createHasamiMatch({ width: 7, height: 7 });
match = submitHasamiSetup(match, 0, homeRow(0), match.setupStep);
match = acknowledgePass(match, 1, match.turn);
match = submitHasamiSetup(match, 1, homeRow(1), match.setupStep);
match = acknowledgePass(match, 0, match.turn);

const moved = handleMove(encodeTrustedMatch(match), 0, { from: { x: 0, y: 6 }, to: { x: 0, y: 5 }, expectedTurn: match.turn });
console.log(moved.view.phase, moved.view.pieces);                 // pass null: the board stays covered
const ready = handleReady(moved.record, 1);
const blue = ready.view.pieces!;
console.log(blue.filter((piece) => piece.owner === 1 && piece.kind !== null).length);  // 7: blue's own pieces, with roles
console.log(blue.filter((piece) => piece.owner === 0 && piece.kind === null).length);  // 7: red's, with none
```

### Words in two languages

Names, roles and the words of the player come in English and Japanese, and are plain functions, so a screen of your own can use them.

```ts
import { modeName, playerName, roleName, words } from "@johnmorrisdotca/gunjin";

console.log(modeName("ja", "gunjin-shogi"));        // 軍人将棋・将棋部ルール
console.log(roleName("en", "lieutenant-colonel"));  // the piece's name, for a label
console.log(playerName("ja", 1));                   // the second side's name
console.log(words("en").title, "/", words("ja").title);
```

### Take the board's colours from the page

The player's text, buttons and handoff panel take their colours from the page's `--kz-ink` and `--kz-paper` custom properties when the page sets them, so one rule on a parent changes both. The board's material is an option instead (`ivory`, `wood`, `slate`).

```css
#game {
  --kz-ink: #1f2320;
  --kz-paper: #fbf8f1;
}
```

### Watch the match from the page

`onChange` hands over the public position after each change and `onFinish` the result. Neither carries a role, so both are safe to send to a server or a spectator's screen.

```ts no-run
import { createMatch } from "@johnmorrisdotca/gunjin/gunjin-shogi";
import { mountGunjin } from "@johnmorrisdotca/gunjin/play";

const game = mountGunjin(document.querySelector<HTMLElement>("#game")!, createMatch("gunjin-shogi"), {
  language: "ja",
  material: "slate",
  pieceStyle: "tiles",
  onChange: (position) => console.log(position.phase, position.turn),     // no roles in it
  onFinish: ({ winner, reason }) => console.log(winner, reason),          // 0, 1 or null for a draw
});

game.set({ material: "wood" });          // a look changes at once, without a new match
const record = game.replay();            // the public replay, as JSON: no roles
game.destroy();                          // when the page removes the game
```

## The five games

All five share one match lifecycle (`setup`, `pass`, `play`, `finished`), one view and one replay, and differ in their boards, their pieces and how a side wins. The full rules, with the places each one departs from a traditional game, are in [docs/RULES.md](docs/RULES.md).

| Game | Mode key | Board | A side's pieces | How a side wins |
| --- | --- | --- | --- | --- |
| Hidden Hasami | `hidden-hasami` | 7×7 or 9×9 | one leader and six or eight guards, all moving alike | capture the leader, leave the other side one stone or no legal move |
| Luzhanqi Mini | `luzhanqi-mini` | 7×8, with four camps and two headquarters a side | 14: commander, two officers, three soldiers, three engineers, two bombs, two mines, a flag | capture the flag, or leave the opponent no mobile piece |
| Salpakan Classic | `salpakan` | 9×8 | 21: from five stars to second lieutenant, a sergeant, six privates, two spies and a flag | capture the flag, or carry your own flag to the far row and survive the reply |
| Hidden Capture Flag | `stratego-lite` | 10×10, with two 2×2 lakes | 40: the original roster, marshal to flag, with six bombs | take the flag, or leave the opponent no move |
| Gunjin Shogi · Club Rules | `gunjin-shogi` | 9×9, with four headquarters | 31: general to flag, with aircraft, tanks, engineers and mines | capture the flag, or enter a headquarters with a piece that may |

What is hidden differs too. In four of the games a battle tells the other side nothing but the result. In Hidden Capture Flag a battle reveals both ranks in the public record, the way the traditional game does, and nothing else is revealed.

## API

The [API reference](https://johnmorrisdotca.github.io/gunjin/api.html) lists every export of every entry point with its signature and its doc comment. It is made from the source by `pnpm site`, so it cannot fall behind the code, and the same information is in [docs/API.md](docs/API.md).

### Entry points

Each concern is an entry of its own, so a page loads only what it uses.

| Import | Use |
| --- | --- |
| `@johnmorrisdotca/gunjin` | Redacted views, public replay, shared types, drawing and styling exports |
| `@johnmorrisdotca/gunjin/hasami` | Hidden Hasami match creation, roster, setup and moves |
| `@johnmorrisdotca/gunjin/luzhanqi-mini` | Luzhanqi Mini match creation, roster, setup and moves |
| `@johnmorrisdotca/gunjin/salpakan` | Salpakan Classic match creation, roster, setup and moves |
| `@johnmorrisdotca/gunjin/stratego-lite` | Hidden Capture Flag: the generic match calls, resigning and draws, its rules and its battle table |
| `@johnmorrisdotca/gunjin/gunjin-shogi` | Gunjin Shogi: the generic match calls, resigning and draws, its rules and its battle table |
| `@johnmorrisdotca/gunjin/trusted` | Full-match serialization for trusted host code: `encodeTrustedMatch` and `decodeTrustedMatch` |
| `@johnmorrisdotca/gunjin/views` | Player and spectator redaction, legal move coordinates, board features (camps, headquarters, lakes) |
| `@johnmorrisdotca/gunjin/draw` | SVG board drawing |
| `@johnmorrisdotca/gunjin/play` | Pass-the-device browser player |

The **generic match calls**, `createMatch(mode, size?)`, `rosterForSetup`, `submitSetup`, `acknowledgePass` and `playMove`, take a match of any mode, and are exported by `/stratego-lite` and `/gunjin-shogi`. The other three modes have entries of their own for creating a match, dealing its roster, taking a setup and applying a move, and use those two entries' `acknowledgePass` to take the handoff. The calls that end a match without a capture, `offerDraw`, `acceptDraw`, `declineDraw` and `resignMatch`, take a match of any mode and are exported by the same two entries (see [End a match by resigning or by agreement](#end-a-match-by-resigning-or-by-agreement)).

### The calls to learn first

| Function | Purpose |
| --- | --- |
| `createHasamiMatch(size?)`, `createLuzhanqiMiniMatch()`, `createSalpakanMatch()` | Create mode-specific matches |
| `createMatch(mode, size?)` | Create any supported match from the generic entry points |
| `rosterForSetup(match, player)` and mode roster functions | Read the current player's piece roster |
| `submitSetup(match, player, placements, expectedSetupStep)` | Validate and submit a private setup immutably |
| `playMove(match, player, { from, to, expectedTurn })` | Validate and apply a move immutably |
| `resignMatch(match, player, expectedTurn)`, `offerDraw`, `acceptDraw`, `declineDraw` | End a match by resignation, or by agreement |
| `viewForPlayer(match, player)`, `publicPosition(match)` | Return role-redacted views |
| `publicReplay(match)`, `encodePublicReplay(match)`, `decodePublicReplay(json)` | Create, encode, and validate role-safe replay records |
| `drawGunjinBoard(view, options?)`, `mountGunjin(element, match, options?)` | Draw SVG or mount the local player |

Calls that make or change a full match belong in trusted host code. Never
send a full `AuthoritativeMatch` or trusted serialization to an opponent.
The local browser player is intended for casual, same-device hotseat play;
a person with access to the browser process can inspect its memory.

## Theming

`mountGunjin(element, match, options?)` accepts:

| Option | Values | Purpose |
| --- | --- | --- |
| `language` | `"en"`, `"ja"` | Interface language |
| `material` | `"ivory"`, `"wood"`, `"slate"` | Board palette |
| `pieceStyle` | `"ink"`, `"tiles"` | Circular or square piece marks |
| `onChange` | `(position: PublicPosition) => void` | Receive redacted public position updates |
| `onFinish` | `(result: { winner: Player \| null; reason: string }) => void` | Receive a finished result |

The returned handle provides `view()`, `replay()`, `set(options)`, and
`destroy()`. `drawGunjinBoard(view, options?)` returns SVG text and accepts
`language`, `material`, `pieceStyle`, `selected`, `targets`, and setup `draft`
options. See [docs/API.md](docs/API.md) for the typed details.

The player's own styles are scoped under the `.gj-root` class; its text, buttons and handoff panel take
their colours from the page's `--kz-ink` and `--kz-paper` custom properties when the page
sets them, so one line of CSS on a parent changes both.

## Limits

The browser player is local hotseat, not an online service. Trusted engine
matches contain both sides' hidden ranks; `PlayerView`, `PublicPosition`, and
public replay records redact roles according to each ruleset. Capture Flag
battle history intentionally reveals both combat ranks. The trusted
serialization is for private host storage, not encrypted storage or a
network protocol. This package provides no matchmaking, account system, or
remote transport.

## Accessibility

What the package does, and where it stops.

- **Every square is a button**, so the board can be played without a pointer: Tab reaches the board, the arrow keys move from square to square, and Enter or Space chooses a piece and then its destination. The board's label says so, and each square says its piece's role (or "Opponent piece" for a hidden one) and, when it is a possible destination, that it is one to choose.
- **The game's state is announced.** The line above the board (whose turn it is, what to do next, how the game ended) is a live status, so a change in it is spoken without moving focus.
- **Focus is visible**: the square that has focus has a 3 px gold outline (`#c4972e`).
- **Buttons are at least 2.75 rem high**, and the board and its squares scale with the page, so they can be pressed on a phone.
- **Colour is not the only mark.** The two sides are told apart by colour (red and blue) and by their marks: a side's own pieces carry letters or kanji for their role, the other side's are plain discs. A disc is never a role in disguise.
- **Nothing moves by itself**: there is no animation and no timer, so a reduced-motion setting changes nothing.
- **Privacy is part of it.** The handoff screen names the player the device goes to and hides the board until that player presses the button, so a person who is looking over a shoulder sees nothing they should not.
- **Not yet.** The handoff panel is a plain panel, not a dialog, so a screen reader is not told that it has appeared. Contrast between a piece's letters and its disc has not been measured on the three materials. Corrections are welcome as [issues](https://github.com/johnmorrisdotca/gunjin/issues).

## Browser support

Any current browser with SVG and ES modules: Chrome, Edge, Firefox and Safari, on a phone or a desk. The demo's tests run in Chromium and WebKit at a phone's width and a desk's, on this Mac and in the Linux image CI uses.

## Languages

The player's words are English and Japanese, chosen with the `language` option. Corrections to the Japanese are welcome as issues.

## Roadmap

The package is an engine and a same-device player, and the limits above are meant: no accounts, matchmaking or network transport. Nothing else is promised for a date, and nothing in the engine or the player is known to be missing; ideas are welcome in the [issues](https://github.com/johnmorrisdotca/gunjin/issues).

## Architecture

```text
src/
├── draw.ts
├── gunjin-shogi.ts
├── hasami.ts
├── index-core.ts
├── index.ts
├── luzhanqi-mini.ts
├── match.ts
├── play.ts
├── replay.ts
├── rules/
│   ├── board.ts
│   ├── gunjinShogi.ts
│   ├── hiddenHasami.ts
│   ├── index.ts
│   ├── luzhanqiMini.ts
│   ├── salpakan.ts
│   ├── strategoLite.ts
│   └── types.ts
├── salpakan.ts
├── stratego-lite.ts
├── strings.ts
├── style.ts
├── trusted.ts
├── types.ts
└── views.ts
```

The engine is `match.ts` and the five modules under `rules/`: each rule module says what a mode's board is, what its roster is, where a piece may go and how a fight ends, and `match.ts` is the one lifecycle that applies them. The entry files at the top are thin: they re-export a mode's calls under its own names. `views.ts` and `replay.ts` are the only code that decides what may be seen, and `draw.ts` and `play.ts` take only what they produce.

## The name

*Gunjin* (軍人) is Japanese for a soldier or military person, read ぐんじん, said in three beats, *gun-ji-n*. It is
the first word of 軍人将棋 (*gunjin shōgi*), "soldier chess", the hidden-rank Japanese army game that gives the
package its name and one of its five modes. ([Wiktionary: 軍人](https://en.wiktionary.org/wiki/軍人).)

## Where it comes from, and where it is used

Gunjin Shogi (軍人将棋) is the Japanese hidden-rank army game that names the package, and the other four modes are in the same family of hidden-rank games: Hasami Shogi, Luzhanqi, Salpakan and Stratego. Their rules are common property, and each mode here is written in its own words and called an adaptation wherever it departs from a traditional ruleset. The sources are listed under References in [docs/RULES.md](docs/RULES.md).

### Used by

Nothing outside the package's own demo is listed yet. Using Gunjin in something? Open an *Add my project* issue and we will add you.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Gunjin is one of twenty-four packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Gunjin.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install
pnpm check          # lint, types, tests and the presentation checks
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm test:demo      # build the demo and play it in a real browser, at a phone's width and a desk's
pnpm screenshots:readme  # retake the README's pictures (docs/images) from the built demo, in light and dark
pnpm test:readme    # run every ts and js example in this README against the built package
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project conventions and checks.

## Contributing

Bug reports and pull requests are welcome in the [issues](https://github.com/johnmorrisdotca/gunjin/issues). Please read
[CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security concern privately,
follow [SECURITY.md](SECURITY.md).

## Changes

Every release is written up in [CHANGELOG.md](./CHANGELOG.md), newest first, in the Keep a Changelog form, with the date of each, and the version follows semantic versioning. The releases are also on the [releases page](https://github.com/johnmorrisdotca/gunjin/releases), each with the tarball that npm publishes.

## Licence

[MIT](./LICENSE) © John Morris. The code, the documentation and the pictures in this README are under the same licence. The five rule sets are written in the package's own words; the traditional games they adapt, and the sources for each, are named in [docs/RULES.md](docs/RULES.md). The package ships no art, sound or data under another licence.
