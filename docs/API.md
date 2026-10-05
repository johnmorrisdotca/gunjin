# API

All entry points are typed ESM and have no runtime dependencies.

## Redacted public API

`@johnmorrisdotca/gunjin` exports `viewForPlayer(match, player)`, `publicPosition(match)`, `legalMovesForCurrentPlayer(match, player)`, `publicReplay(match)`, `encodePublicReplay(match)`, `decodePublicReplay(json)`, `drawGunjinBoard(view, options)`, and `mountGunjin(element, match, options)`. The public root does not export functions that create or mutate authoritative matches.

A `PlayerView` shows own roles and enemy occupancy only. `PublicPosition` omits roles and piece IDs. Public replay records omit roles except for ranks revealed by Capture Flag battles. Move requests use `{ from, to, expectedTurn }`; stale turns are rejected by the engine.

## Trusted engine APIs

`@johnmorrisdotca/gunjin/hasami`, `/luzhanqi-mini`, `/salpakan`, `/stratego-lite`, `/gunjin-shogi`, and `/trusted` create and mutate complete role-bearing matches. They are for trusted host code and must never serialize full state to an opponent or public endpoint. `/trusted` adds host-only full-match serialization; it is not a secure storage layer.

The local hotseat `mountGunjin` interface suppresses the board during setup handoff. Both players use the same browser process, so it is intended for casual pass-the-device play. A secure remote service must keep `AuthoritativeMatch` server-side and return only the appropriate `PlayerView`.

## Drawing

`drawGunjinBoard` accepts a `PlayerView`, language (`en` or `ja`), material (`ivory`, `wood`, `slate`), and piece style (`ink`, `tiles`). It returns SVG text. `mountGunjin` accepts the same appearance options and callbacks for public position changes and finished results.
