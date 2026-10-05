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

<p align="center">
  <img src="docs/desktop.jpg" alt="Gunjin's desktop hotseat game and settings" width="720">
  <img src="docs/phone.jpg" alt="Gunjin's phone layout" width="220">
</p>

Gunjin brings five hidden-rank strategy games together behind one small API:
Hidden Hasami, Luzhanqi Mini, Salpakan Classic, Hidden Capture Flag, and
Gunjin Shogi · Club Rules. The rules and adaptations are documented in
[Rules](docs/RULES.md); each mode is named plainly where it differs from a
traditional ruleset.

- **Play locally.** Two people arrange their pieces privately and pass one
  device between turns. Opposing ranks stay hidden in the player view.
- **Build your own interface.** Pure functions create matches, validate
  setups and moves, and produce redacted views and public replays.
- **Choose a look.** The browser player supports English or Japanese, three
  board materials, and two piece styles.
- **Use it anywhere.** Typed ES modules, no runtime dependencies, and no
  framework requirement.

## A match in 30 seconds

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

A complete setup is submitted through the trusted mode entry point, one
player at a time. The browser player takes an authoritative match and handles
private setup, device handoff, play, and public replay download:

```ts
import { createHasamiMatch } from "@johnmorrisdotca/gunjin/hasami";
import { mountGunjin } from "@johnmorrisdotca/gunjin/play";

const match = createHasamiMatch({ width: 7, height: 7 });
const game = mountGunjin(document.querySelector("#game")!, match, {
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

## Entry points

| Import | Use |
| --- | --- |
| `@johnmorrisdotca/gunjin` | Redacted views, public replay, shared types, drawing and styling exports |
| `@johnmorrisdotca/gunjin/hasami` | Hidden Hasami match creation, roster, setup and moves |
| `@johnmorrisdotca/gunjin/luzhanqi-mini` | Luzhanqi Mini match creation, roster, setup and moves |
| `@johnmorrisdotca/gunjin/salpakan` | Salpakan Classic match creation, roster, setup and moves |
| `@johnmorrisdotca/gunjin/stratego-lite` | Hidden Capture Flag rules and engine functions |
| `@johnmorrisdotca/gunjin/gunjin-shogi` | Gunjin Shogi rules and engine functions |
| `@johnmorrisdotca/gunjin/trusted` | Generic engine, setup, turns, and full-match serialization for trusted host code |
| `@johnmorrisdotca/gunjin/views` | Player and spectator redaction, legal move coordinates, board features |
| `@johnmorrisdotca/gunjin/draw` | SVG board drawing |
| `@johnmorrisdotca/gunjin/play` | Pass-the-device browser player |

The five rulesets and their adaptations are described in
[docs/RULES.md](docs/RULES.md). Signatures and types are listed in the
[API reference](https://johnmorrisdotca.github.io/gunjin/api.html) and
[docs/API.md](docs/API.md).

## API at a glance

| Function | Purpose |
| --- | --- |
| `createHasamiMatch(size?)`, `createLuzhanqiMiniMatch()`, `createSalpakanMatch()` | Create mode-specific matches |
| `createMatch(mode, size?)` | Create any supported match from the trusted entry point |
| `rosterForSetup(match, player)` and mode roster functions | Read the current player's piece roster |
| `submitSetup(match, player, placements, expectedSetupStep)` | Validate and submit a private setup immutably |
| `playMove(match, player, { from, to, expectedTurn })` | Validate and apply a move immutably |
| `viewForPlayer(match, player)`, `publicPosition(match)` | Return role-redacted views |
| `publicReplay(match)`, `encodePublicReplay(match)`, `decodePublicReplay(json)` | Create, encode, and validate role-safe replay records |
| `drawGunjinBoard(view, options?)`, `mountGunjin(element, match, options?)` | Draw SVG or mount the local player |

Calls that make or change a full match belong in trusted host code. Never
send a full `AuthoritativeMatch` or trusted serialization to an opponent.
The local browser player is intended for casual, same-device hotseat play;
a person with access to the browser process can inspect its memory.

## Player options and appearance

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

## Limits and information boundaries

The browser player is local hotseat, not an online service. Trusted engine
matches contain both sides' hidden ranks; `PlayerView`, `PublicPosition`, and
public replay records redact roles according to each ruleset. Capture Flag
battle history intentionally reveals both combat ranks. The trusted
serialization is for private host storage, not encrypted storage or a
network protocol. This package provides no matchmaking, account system, or
remote transport.

## Development

```sh
pnpm install
pnpm check
pnpm build
pnpm site
```

See [Contributing](CONTRIBUTING.md) for the project conventions and checks.

## The game family

Gunjin is made for [Itsutsu](https://itsutsu.com), alongside
[Kyuubu](https://github.com/johnmorrisdotca/kyuubu),
[Kazu](https://github.com/johnmorrisdotca/kazu),
[Jirai](https://github.com/johnmorrisdotca/jirai), and
[Tobiishi](https://github.com/johnmorrisdotca/tobiishi).
Their demos share the family stylesheet, header, footer and colour palette.

## Contribution, security, and licence

Bug reports and contributions are welcome. Please read
[CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). To report a security concern privately,
follow [SECURITY.md](SECURITY.md).

Gunjin is released under the [MIT licence](LICENSE).
