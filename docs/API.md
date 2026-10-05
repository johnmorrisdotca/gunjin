# API reference

Gunjin ships typed ES modules and has no runtime dependencies. See the
[interactive API reference](https://johnmorrisdotca.github.io/gunjin/api.html)
for the complete generated signatures.

## Public root

`@johnmorrisdotca/gunjin` exports the shared types, `drawGunjinBoard`,
`mountGunjin`, `GUNJIN_STYLE`, `STRINGS`, `words`, `modeName`, `playerName`,
`roleName`, `boardFeatures`, `legalMovesForCurrentPlayer`, `publicPosition`,
`viewForPlayer`, `publicReplay`, `encodePublicReplay`, and
`decodePublicReplay`.

`PlayerView` returns the viewer's own roles and hides opposing roles.
`PublicPosition` omits roles and piece IDs. Public replay records omit hidden
roles, with the documented Capture Flag battle reveals. Move requests have
shape `{ from, to, expectedTurn }`; stale turns are rejected.

## Mode entry points

| Import | Exports |
| --- | --- |
| `/hasami` | `createHasamiMatch(size?)`, `hasamiRoster(size)`, `submitHasamiSetup(match, player, placements, expectedSetupStep)`, `playHasamiMove(match, player, action)` |
| `/luzhanqi-mini` | `createLuzhanqiMiniMatch()`, `luzhanqiMiniRoster()`, `submitLuzhanqiMiniSetup(match, player, placements, expectedSetupStep)`, `playLuzhanqiMiniMove(match, player, action)` |
| `/salpakan` | `createSalpakanMatch()`, `salpakanRoster()`, `submitSalpakanSetup(match, player, placements, expectedSetupStep)`, `playSalpakanMove(match, player, action)` |
| `/stratego-lite` | `createMatch`, `rosterForSetup`, `submitSetup`, `acknowledgePass`, `playMove`, `STRATEGO_LITE_RULES`, `strategoCombat` |
| `/gunjin-shogi` | `createMatch`, `rosterForSetup`, `submitSetup`, `acknowledgePass`, `playMove`, `GUNJIN_SHOGI_RULES`, `gunjinCombat` |

The mode entry points return authoritative matches containing both sides'
roles. Keep them in trusted host code. `/trusted` provides generic engine
operations and `encodeTrustedMatch` / `decodeTrustedMatch` for private host
storage. This serialization is neither encryption nor a network protocol.
The five rule adaptations are detailed in [RULES.md](RULES.md).

## Shared engine and views

`/trusted` re-exports `createMatch`, `rosterForSetup`, `submitSetup`,
`acknowledgePass`, `playMove`, `offerDraw`, `acceptDraw`, `declineDraw`,
`resignMatch`, `encodeTrustedMatch`, and `decodeTrustedMatch`.

`/views` exports `viewForPlayer(match, viewer)`, `publicPosition(match)`,
`legalMovesForCurrentPlayer(match, player)`, and
`boardFeatures(mode, width, height)`. These are role-redacted views and legal
coordinates for the player currently moving.

The root also exports `publicReplay(match)`,
`encodePublicReplay(match)`, and `decodePublicReplay(json)`. Public replays
cannot resume a match.

## Drawing and browser player

`drawGunjinBoard(view, options?)` from `/draw` returns SVG text. Options are
`language?: "en" | "ja"`, `material?: "ivory" | "wood" | "slate"`,
`pieceStyle?: "ink" | "tiles"`, `selected?: Coordinate`,
`targets?: readonly Coordinate[]`, and setup `draft?: readonly SetupPiece[]`.

`mountGunjin(element, match, options?)` from `/play` mounts the local
pass-the-device interface. `MountOptions` includes `language`, `material`,
`pieceStyle`, `onChange(position: PublicPosition)`, and
`onFinish({ winner: Player | null; reason: string })`. It returns a
`GunjinMount` with `view()`, `replay()`, `set(options)`, and `destroy()`.
The player suppresses the board during setup handoff. It is intended for
casual local play: access to the same browser process can expose its memory.
