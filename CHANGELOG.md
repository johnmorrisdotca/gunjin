# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
