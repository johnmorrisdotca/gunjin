---
title: Getting started
section: tutorial
order: 1
description: Arrange a native Hasami match and inspect the legal first move.
---

## Complete both private setups

```ts
import { createHasamiMatch,hasamiRoster,submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
const home=(player:0|1)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
let match=createHasamiMatch({width:7,height:7});
match=submitHasamiSetup(match,0,home(0),match.setupStep);
match=acknowledgePass(match,1,match.turn);
match=submitHasamiSetup(match,1,home(1),match.setupStep);
match=acknowledgePass(match,0,match.turn);
console.log(match.phase,match.currentPlayer,match.setupStep);
```

Each mode’s entry creates its own match and takes a complete roster in its allowed home cells. The first side submits, the device passes to the second, the second submits, then the device returns to the first for play. Keep the returned state after every accepted operation. The initial state and complete rosters are authoritative data.

## Choose a public boundary

Use the mode entry for rules. Use `/views` for the authenticated player or observer projection, `/draw` for SVG and `/play` for the native shared-device player. `/trusted` is host storage. Main-entry public replay is a different, redacted record. Continue with [views](redacted-views.md) or [native mounting](native-player.md).
