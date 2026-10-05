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

## References

- Japan Shogi Association, [Hasami Shogi rules](https://www.shogi.or.jp/knowledge/hasami_shogi/). The hidden leader and expanded board are original adaptations.
- [Luzhanqi rules overview](https://ancientchess.com/page/play-luzhanqi.htm). Luzhanqi Mini is a deliberately streamlined original ruleset.
- [Salpakan rules](https://philggo.wixsite.com/home/rules). Local variations may differ; this implementation documents its decisions above.
