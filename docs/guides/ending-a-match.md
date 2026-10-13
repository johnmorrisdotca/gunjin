---
title: Resign or agree a draw
section: how-to
order: 6
description: Keep ending requests on the native player/turn boundary.
---

## Offer, pass, acknowledge and accept

```ts
import { createHasamiMatch,hasamiRoster,submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
const home=(player:0|1)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
let match=createHasamiMatch({width:7,height:7});
match=submitHasamiSetup(match,0,home(0),match.setupStep);
match=acknowledgePass(match,1,match.turn);
match=submitHasamiSetup(match,1,home(1),match.setupStep);
match=acknowledgePass(match,0,match.turn);
import { offerDraw,acceptDraw,resignMatch } from "@johnmorrisdotca/gunjin/gunjin-shogi";
const offered=offerDraw(match,0,match.turn);
const received=acknowledgePass(offered,1,offered.turn);
console.log(acceptDraw(received,1,received.turn).result);
console.log(resignMatch(match,0,match.turn).result);
```

The draw offer passes the device. The receiving player acknowledges and then accepts or declines on the native turn. An agreed draw has winner null. Resignation names the opponent as winner. Stale or out-of-turn ending requests are refused. Do not accept a UI label or serialized result as authority to finish a match; use the host’s native lifecycle.
