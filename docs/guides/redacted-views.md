---
title: Show only the viewer’s information
section: how-to
order: 4
description: Separate authoritative state, player views and observer positions.
---

## Project the state before rendering

```ts
import { createHasamiMatch,hasamiRoster,submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
const home=(player:0|1)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
let match=createHasamiMatch({width:7,height:7});
match=submitHasamiSetup(match,0,home(0),match.setupStep);
match=acknowledgePass(match,1,match.turn);
match=submitHasamiSetup(match,1,home(1),match.setupStep);
match=acknowledgePass(match,0,match.turn);
import { viewForPlayer,publicPosition } from "@johnmorrisdotca/gunjin/views";
const red=viewForPlayer(match,0);
console.log(red.pieces?.find(piece=>piece.owner===1));
console.log(publicPosition(match).pieces?.[0]);
```

A player’s own pieces carry their native role and id. Opponent roles are null and opponent ids are omitted. Observer positions contain ownership/coordinates without role or id. During setup/pass, board pieces are null; the requested player’s own setup is available only in setup. Null here means intentionally hidden, not a missing board.

## Public combat information

Only the mode-published combat ranks can appear in public logs/replay. Other secret roles and setup layouts remain private. The renderer accepts a PlayerView, not an authoritative match. A remote host must authenticate which viewer receives a projection. Browser markup cannot protect a secret that was already sent in full state.
