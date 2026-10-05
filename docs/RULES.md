# Rules and source notes

These rules are the implemented versions described in the package. Where the game is adapted, it is named as an adaptation rather than presented as a complete traditional ruleset.

## Hidden Hasami

### 🗺️ Board & Components

Use a square 7×7 or 9×9 board. Each side starts with one leader and six or eight guards, all on its home back row.

### 🤫 Hidden Information Logic

Each owner knows which of their stones is the leader. All stones have identical movement. Enemy roles stay hidden; only capturing the leader is announced as an objective capture. This is an original hidden-leader adaptation inspired by Hasami, not traditional hidden-role Hasami Shogi.

### ⚔️ Movement & Combat Rules

A stone slides any clear number of squares horizontally or vertically and stops on an empty square. A move may capture multiple contiguous enemy runs in all four directions when the moved stone and another friendly stone bracket each run. The board edge does not bracket; moving into a sandwich never captures the moving stone.

### 🏆 Victory Conditions

Capture the enemy leader, reduce the opposing side to one stone, or leave it with no legal move. A third occurrence of the same public board and side-to-move is a draw.

## Luzhanqi Mini

### 🗺️ Board & Components

The board is 7 files by 8 ranks. Each side fills its nearest two rows with one commander (rank 4), two officers (3), three soldiers (2), three engineers (1), two bombs, two mines, and one flag. Four camps are at (1,3), (5,3), (1,4), and (5,4). Each home back row has headquarters at files 1 and 5, and the flag begins on one.

### 🤫 Hidden Information Logic

Piece identities remain private after battle. Public logs contain coordinates, counts, and public results only. This is a streamlined original game informed by Luzhanqi; it omits several traditional board and combat rules and should not be treated as a full Luzhanqi rulebook.

### ⚔️ Movement & Combat Rules

Commander, officer, soldier, engineer, and bomb each move one orthogonal square. Flag and mine cannot move. A camp occupant cannot be attacked; a piece can leave a camp. A flag attack wins first. Otherwise, if a bomb is involved, both pieces are removed. An engineer attacking a mine removes it and occupies its square; another attacker is removed and the mine remains. In ordinary combat, higher rank wins and equal rank removes both. Mines can only be set up on the back row, bombs cannot be in the front row, and the flag must occupy a headquarters. There are no rails, diagonal moves, mountains, headquarters freezing, or commander-death reveal.

### 🏆 Victory Conditions

Capture the flag or leave the opponent without any legal mobile move.

## Salpakan Classic

### 🗺️ Board & Components

Use a 9×8 board. Each player's 21 pieces fit in that player's nearest three rows: five-star, four-star, three-star, two-star, one-star, colonel, lieutenant-colonel, major, captain, first-lieutenant, second-lieutenant, sergeant, six privates, two spies, and one flag.

### 🤫 Hidden Information Logic

All roles stay hidden from the opponent after setup and combat. The referee announces only the public battle result. The game draws on published Salpakan rules, with platform choices called out below where not fully specified by the source.

### ⚔️ Movement & Combat Rules

Every piece moves one orthogonal step, including the flag. Higher officers defeat lower officers and private pieces. A spy defeats an officer or flag; a private defeats a spy. Equal combatants remove both. The flag loses to any attacker other than another attacking flag, which captures it. Reaching the opponent's back row with your flag starts a claim that succeeds after one complete enemy turn; a captured flag takes precedence. Resignation is a loss. A mutually accepted draw is a draw. This implementation treats no legal move as a loss, a platform choice.

### 🏆 Victory Conditions

Capture the opposing flag or complete the flag-advance claim. Resignation loses; mutually agreed draw ends the game.

## Hidden Capture Flag

### 🗺️ Board & Components

The 10×10 board has the four central 2×2 lake regions at files 2–3 and 6–7, ranks 4–5. Each side uses the 40-piece Stratego Original roster: marshal 1, general 1, colonel 2, major 3, captain 4, lieutenant 4, sergeant 4, miner 5, scout 8, spy 1, bomb 6, flag 1.

### 🤫 Hidden Information Logic

Players arrange their own four rows in private. A battle reveals both participating ranks in the public event history. Remaining opposing ranks stay hidden in player views.

### ⚔️ Movement & Combat Rules

Pieces other than scout move one orthogonal square; scouts travel any clear orthogonal distance. No piece may enter or pass over a lake. Bombs and flags are immobile. A higher numbered rank defeats a lower one, equal ranks remove both, a miner removes a bomb, and a spy defeats a marshal only on attack. A bomb defeats every attacker except a miner. This package omits the manual's repeated-two-square and pursuit restrictions.

### 🏆 Victory Conditions

Take the flag or leave the opponent without a move.

## Gunjin Shogi · Shogi Club Rules Adaptation

### 🗺️ Board & Components

The mode follows the documented “Shogi Club Rules” roster: one each of general, lieutenant general, spy, and flag; two each of major general, colonel, lieutenant colonel, major, captain, lieutenant, second lieutenant, aircraft, and cavalry; three each of tank, engineer, and mine. Each player arranges all 31 pieces in their nearest four rows on a 9×9 board. The engine marks headquarters at (3,0), (5,0), (3,8), and (5,8); the source's bridge terrain is omitted.

### 🤫 Hidden Information Logic

Opponent identities remain hidden even after battles. Only the local player sees their ranks during setup. Public logs do not identify combatants.

### ⚔️ Movement & Combat Rules

General through major move one orthogonal square; captain through second lieutenant move up to two; cavalry up to three; engineer slides through any clear distance; aircraft may attack any opposing piece; mines cannot move. Ordinary ranks resolve by the order general, lieutenant general, major general, colonel, lieutenant colonel, major, captain, lieutenant, second lieutenant, cavalry. Spy defeats general and lieutenant general. Aircraft defeats all but the three general ranks. Tank loses to general ranks, aircraft, engineer, and mine, and defeats other pieces. Engineer defeats mine, spy, and tank. Mines defeat every other attacker. Equal types remove both. A flag loses with any opposing combatant. Entering an opposing headquarters wins unless the moving piece is a tank, aircraft, or engineer. The board layout and headquarters markings are adaptations.

### 🏆 Victory Conditions

An eligible piece that enters an opposing headquarters wins. No legal move is a loss.

## References

- Japan Shogi Association, [Hasami Shogi rules](https://www.shogi.or.jp/knowledge/hasami_shogi/). The hidden leader and expanded board are original adaptations.
- [Luzhanqi rules overview](https://ancientchess.com/page/play-luzhanqi.htm). Luzhanqi Mini is a deliberately streamlined original ruleset.
- [Salpakan rules](https://philggo.wixsite.com/home/rules). Local variations may differ; this implementation documents its decisions above.
- Jumbo, [Stratego Travel / Original instructions](https://assets.jumboplay.com/12761_manual.pdf), pp. 5–6. The implementation omits repeated-two-square and pursuit restrictions.
- [Gunjin Shogi: Shogi Club Rules](https://www.ne.jp/asahi/tetsu/toybox/kapitan/kp036.htm). The community-published variant supplies this mode's roster, rank table, movement, and headquarters exceptions; this package uses a plain 9×9 adaptation.
