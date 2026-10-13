---
title: Draw redacted boards and terrain
section: how-to
order: 7
description: Use native views, board features and presentation-only choices.
---

## Draw a native view

```ts
import { createHasamiMatch,hasamiRoster,submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
const home=(player:0|1)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
let match=createHasamiMatch({width:7,height:7});
match=submitHasamiSetup(match,0,home(0),match.setupStep);
match=acknowledgePass(match,1,match.turn);
match=submitHasamiSetup(match,1,home(1),match.setupStep);
match=acknowledgePass(match,0,match.turn);
import { drawGunjinBoard } from "@johnmorrisdotca/gunjin/draw";
import { viewForPlayer,boardFeatures } from "@johnmorrisdotca/gunjin/views";
console.log(drawGunjinBoard(viewForPlayer(match,0),{language:"ja",material:"wood",pieceStyle:"tiles"}).startsWith("<svg"));
console.log(boardFeatures("luzhanqi-mini",7,8));
```

Camps, headquarters and lakes are public board markings. Their mode-specific movement effects remain in the rules engine. Language, material, piece style, selected coordinate and targets affect rendering, not legality. Private setup drafts belong only to their owner’s setup display. SVG text can be used outside a browser with a redacted view.
