# Gunjin · 軍人

A TypeScript family of five hidden-rank strategy board games. The package has no runtime dependencies. It includes a typed game core, a hotseat browser player, Japanese and English interface strings, and safe public views for display and replay.

## Games

### Hidden Hasami

### 🗺️ Board & Components

A 9×9 board has nine stones per player on the home back row. A 7×7 option uses seven stones. Each side secretly assigns one leader and the remaining guards.

### 🤫 Hidden Information Logic

Every stone moves the same way. The leader is identified only to its owner in the local hotseat setup. Opponent roles remain hidden during play and are announced only if the leader is captured. This is an original hidden-leader adaptation, not traditional Hasami Shogi.

### ⚔️ Movement & Combat Rules

Move any stone horizontally or vertically any clear number of empty cells. After the move, in each of the four directions, remove a contiguous enemy run bracketed by the moved stone and another friendly stone. Edge and corner contact do not count as brackets; a player may move into a sandwich without losing their own stone.

### 🏆 Victory Conditions

Capture the enemy leader, reduce the enemy to one stone, or leave the opponent without a legal move. Three occurrences of the same public position, including the player to move, draw the game.

### Luzhanqi Mini

### 🗺️ Board & Components

A 7×8 board has 14 pieces per side, filling the two home rows: one commander, two officers, three soldiers, three engineers, two bombs, two mines, and one flag. Four camps are at (1,3), (5,3), (1,4), and (5,4). The two headquarters on a home back row are at x=1 and x=5; the flag starts in one.

### 🤫 Hidden Information Logic

Ranks stay hidden after a battle. The public record reports only captured cells, counts, and game outcomes; it never records a defeated rank. This ruleset is an original streamlined game, not a complete statement of Luzhanqi rules. Its secret roles are intended for a trusted referee or private host process.

### ⚔️ Movement & Combat Rules

Commander, officer, soldier, engineer, and bomb move one orthogonal square. Flags and mines cannot move. Camps cannot be attacked, though a piece may leave a camp. A flag attack wins before other combat; a bomb removes both pieces; an engineer defeats a mine, while any other attacker is removed and the mine remains. Otherwise the higher rank wins and equal ranks remove both. Mines stay in the home back row; bombs cannot be placed in the front row. This compact version has no rail movement, diagonal movement, mountains, headquarters freezing, or commander-death reveal.

### 🏆 Victory Conditions

Capture the flag or leave the opponent with no legal move. A flag attack ends the game immediately.

### Salpakan Classic

### 🗺️ Board & Components

A 9×8 board has 21 pieces on each player's nearest three rows: one each of five-star, four-star, three-star, two-star, one-star, colonel, lieutenant-colonel, major, captain, first lieutenant, second lieutenant, and sergeant; six privates; two spies; and one flag.

### 🤫 Hidden Information Logic

Setups and piece identities stay hidden from the opponent, including after combat. The referee resolves combat privately and announces only public outcomes. This is a documented implementation of Salpakan's hidden-rank style; it is not a claim that every local variant uses identical details.

### ⚔️ Movement & Combat Rules

Every piece, including the flag, moves one orthogonal square. Higher officers defeat lower officers and privates. A spy defeats any officer and the flag; a private defeats a spy. Equal pieces, including two spies, remove each other. A flag loses to every attacker except an attacking flag, which captures it. A flag reaching the opposing back row must survive one full enemy turn; capture is checked before that claim is awarded. Resignation loses; an agreed draw is a draw. This implementation treats a player with no legal move as losing.

### 🏆 Victory Conditions

Capture the opposing flag, or move your own flag to the opposing back row and keep it there through the opponent's reply turn. Resignation loses; an agreed draw ends the game.

### Hidden Capture Flag

### 🗺️ Board & Components

A 10×10 board uses the 40-piece roster and central lake squares from Stratego Original: marshal, general, two colonels, three majors, four captains, four lieutenants, four sergeants, five miners, eight scouts, one spy, six bombs, and one flag. Each side fills its four home rows.

### 🤫 Hidden Information Logic

Ranks are private during setup and play. Each battle publicly records both combatant ranks, as in the cited rule manual. Rank reveals remain in public match history; a player's current view still redacts opposing pieces on the board.

### ⚔️ Movement & Combat Rules

Mobile pieces move one orthogonal square; scouts slide through any number of clear cells in a straight line. Lakes cannot be entered or crossed. Bombs and flags do not move. Higher rank wins, equal ranks remove both, a miner defeats a bomb, and a spy defeats a marshal only when attacking. This ruleset omits the manual's repeated-two-square and pursuit restrictions; it uses an original neutral title and no copied game art.

### 🏆 Victory Conditions

Capture the opposing flag or leave the opponent without a legal move. A scout can capture a flag at range when the path is clear.

### Gunjin Shogi · Club Rules Adaptation

### 🗺️ Board & Components

A plain 9×9 board uses the 31-piece roster documented for “Shogi Club Rules”: one general, one lieutenant general, two major generals, two colonels, two lieutenant colonels, two majors, two captains, two lieutenants, two second lieutenants, two aircraft, three tanks, two cavalry, three engineers, one spy, three mines, and one flag. Pieces are placed in the nearest four rows. Four marked headquarters are at (3,0), (5,0), (3,8), and (5,8).

### 🤫 Hidden Information Logic

The hotseat setup hides the board while the device changes hands. Opposing identities remain hidden after combat; public history contains only locations, capture counts, and outcomes. The mode follows the roster and combat table of the published Shogi Club rules while adapting its board to a plain 9×9 grid.

### ⚔️ Movement & Combat Rules

Generals and officers through major move one orthogonal square; captains, lieutenants, and second lieutenants move up to two clear squares; cavalry moves up to three; engineers slide any clear distance; aircraft may attack any opposing piece directly; mines cannot move. Ordinary rank order runs from general down through cavalry. Spy defeats general or lieutenant general; aircraft defeats all except the three general ranks; tank defeats ranks below major general but loses to general ranks, aircraft, engineer, and mine; engineer defeats mine, spy, and tank; mine defeats every other attacker. Equal kinds remove both pieces. A flag entering combat is removed with its opponent. Occupying an opposing headquarters wins unless the moving piece is a tank, aircraft, or engineer. This adaptation omits the source board's bridge-specific movement and uses a plainly marked headquarters layout.

### 🏆 Victory Conditions

Occupy an opposing headquarters with an eligible surviving piece. A player without a legal move loses.

## Information boundaries

`PlayerView`, `PublicPosition`, and public replay records omit hidden enemy roles and piece IDs. Capture Flag battles intentionally add both publicly revealed combat ranks to history. The SVG renderer accepts only `PlayerView`, so unexposed enemy ranks do not enter its labels, data attributes, or glyphs. The browser player is for passing one device between players; someone with access to the same browser process can inspect its memory. For private online play, keep the authoritative state on a trusted host and send each player only their redacted `PlayerView`. `./trusted` deliberately contains role-bearing serialization and is for trusted host storage only.

## Use

```ts
import { createHasamiMatch, hasamiRoster } from "@johnmorrisdotca/gunjin/hasami";
import { mountGunjin } from "@johnmorrisdotca/gunjin/play";
import { viewForPlayer } from "@johnmorrisdotca/gunjin/views";

const match = createHasamiMatch({ width: 7, height: 7 });
console.log(hasamiRoster(7));
// Submit each player's setup with submitSetup from @johnmorrisdotca/gunjin/trusted.
// Mount the authoritative state only in the local hotseat interface.
```

Mode engine entry points (`/hasami`, `/luzhanqi-mini`, `/salpakan`, `/stratego-lite`, `/gunjin-shogi`) return full authoritative matches for a trusted host. The root entry point exports redacted views, rendering, replay, and browser player APIs. See [API](docs/API.md), [rules](docs/RULES.md), and [the browser demo](https://johnmorrisdotca.github.io/gunjin/).
