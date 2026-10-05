# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
