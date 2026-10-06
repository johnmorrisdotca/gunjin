# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-10-06

### Added

- **A host can end a match by resignation or by agreement.** `resignMatch`, `offerDraw`, `acceptDraw` and `declineDraw`, which the player used and no entry exported, are now exported by `/stratego-lite` and `/gunjin-shogi`, the entries that carry the generic match calls, and take a match of any mode. Only the side to move may resign or offer; the other side accepts or declines on its own turn, once the handoff is acknowledged; a call by the wrong side, for a stale turn or outside play throws a `RangeError` and changes nothing. Resigning is public and gives the match to the other side, and an agreed draw has no winner.
- **Hidden Capture Flag's two 2×2 lakes are drawn.** The rules always kept them, and the board showed plain squares. `drawGunjinBoard` and the player now draw each lake as one piece of water with ripples, in a colour for each of the three materials (ivory, wood and slate, so in light and dark), and each lake square is named "Lake" (湖) to a screen reader in the player. `boardFeatures` returns `lakes` beside `camps` and `headquarters`, an empty list for the other four games.
- Tests for both: `src/ending.test.ts` ends a match of every mode by resignation, by an accepted draw and by a declined one, and tries the wrong side, a stale turn, a handoff and a finished match; `src/lakes.test.ts` holds the drawn lakes to the squares the rules refuse a piece. The README has a runnable example of ending a match, and `pnpm test:readme` runs it.

### Changed

- `offerDraw` refuses an offer from a side that has an offer from the other side waiting for its answer; it has to accept it or decline it, or move.
- `decodeTrustedMatch` also refuses a record whose `drawOffer` or `passPurpose` is not one the engine writes.
- The README's pictures of Hidden Capture Flag are taken again with the lakes in them, and its Roadmap no longer lists either gap. `docs/RULES.md` said four lakes; there are two.
- Repository only: the README lint also fails a README over 64,000 characters, since npm shows only the first 65,536 of one. The README is 46,000.

## [0.1.4] - 2026-10-06

Nothing that was exported has changed. npm shows the README from the tarball, so a README that is fuller is a release.

### Added

- **The README follows the family's README standard** (johnmorrisdotca/.github, `README-STANDARD.md`): a hero picture under the title, `### What's in it` with a picture of each game, an install section, an **Examples** section whose code is run by a test, a table of the five games, an **Accessibility** section, and the entry points and the calls to learn first under API.
- Twenty pictures in `docs/images`, in light and dark, taken from the built demo by `pnpm screenshots:readme` (`scripts/readme-pictures.mjs`) and shown by absolute address so that GitHub and npm both show them. They are WebP, each under its size budget, and are never in the tarball: `pnpm test:package` fails if one is.
- `pnpm test:readme` type-checks and runs every TypeScript and JavaScript example in the README against the built package, and the `readme` job in CI runs it.
- `src/readme.test.js` holds the README to the standard: its sections in order, a language on every code block, a picture's file, its alt text, its caption and its dark twin, the size budget, table widths and plain words.

### Changed

- The README's pictures moved from `docs/desktop.jpg` and `docs/phone.jpg` to `docs/images/`, and `scripts/check-presentation.mjs` reads the new names.
- Repository only: the package and everything it exports are unchanged. `CONTRIBUTING.md` is the family's one text with a section of its own for Gunjin, held to the master in johnmorrisdotca/.github by `src/family.test.js`; `ci.yml` and `pages.yml` are the family's one text (`pnpm check`, the demo, and the package on Linux, macOS and Windows), and any jobs of the package's own after them.
- The demo's page titles read `Gunjin · pitch`, like the rest of the family's.

### Fixed

- `docs/API.md` and the README said the `/trusted` entry exports the generic match calls (`createMatch`, `acknowledgePass`, `offerDraw`, `resignMatch` and the rest). It exports `encodeTrustedMatch` and `decodeTrustedMatch`; the generic calls are in `/stratego-lite` and `/gunjin-shogi`, and the draw and resign calls are not exported from any entry. The documents now say so. Nothing the package exports has changed.
- The API reference page wraps a long entry path instead of running about 2 px wider than a 360 px screen. Nothing the package exports has changed.

## [0.1.3] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/gunjin@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.
- The README has the family's sections in the family's order (Features, Use it in your project, API, Theming, Limits, Browser support, Languages, Roadmap, Architecture, Where it comes from, Changes), the family list sits under "Where it comes from", and a test holds it to them.

## [0.1.2] - 2026-10-05

### Fixed

- Gunjin Shogi: a piece that captures the flag now wins the game. Before, the battle removed both pieces and nobody won.
- The live demo loaded nothing on GitHub Pages: its script imported the library from the wrong folder. It now imports `./dist`, and the demo's tests serve the site under `/gunjin/` as Pages does, so they would catch it.
- Hidden Capture Flag and Gunjin Shogi crashed in the demo when New game was pressed, because the page asked for a match without naming the mode. Both open now.
- The Game and Board selects no longer overlap at a phone's width.

### Changed

- The rules page now says that aircraft and engineers are the pieces that defeat a mine, that a mine cannot be placed on files 3 and 5 of the front rank, and that the aircraft moves to any empty square.
- The demo, its README family list and its tests are the family's own: the shared header, footer and list of twenty-two, written from one template.

### Added

- A browser test that plays a Gunjin Shogi game to its end.

## [0.1.1] - 2026-10-05

- Complete family-style README, desktop/phone screenshots, badges, API reference, keywords and linked MIT licence.
- Source-derived signatures and API comments, contribution/security files and package presentation validation.
- Trusted saved matches now decode all five supported modes, including Capture Flag and Gunjin Shogi.

## [0.1.0] - 2026-10-05

- First release of Capture Flag, Gunjin Shogi, Hidden Hasami, Luzhanqi Mini and Salpakan Classic.
- Added immutable typed game state, redacted player views and public replay, SVG drawing, and a hotseat browser player.
