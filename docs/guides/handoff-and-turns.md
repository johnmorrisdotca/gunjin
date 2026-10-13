---
title: Pass the device and reject stale actions
section: how-to
order: 3
description: Use setupStep and turn with the native lifecycle.
---

## Move with the observed turn

```ts
import { createHasamiMatch,hasamiRoster,submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
const home=(player:0|1)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
let match=createHasamiMatch({width:7,height:7});
match=submitHasamiSetup(match,0,home(0),match.setupStep);
match=acknowledgePass(match,1,match.turn);
match=submitHasamiSetup(match,1,home(1),match.setupStep);
match=acknowledgePass(match,0,match.turn);
import { legalMovesForCurrentPlayer } from "@johnmorrisdotca/gunjin/views";
import { playHasamiMove } from "@johnmorrisdotca/gunjin/hasami";
const move=legalMovesForCurrentPlayer(match,0)[0]!;
match=playHasamiMove(match,0,{...move,expectedTurn:match.turn});
console.log(match.phase,match.currentPlayer);
```

Use `expectedSetupStep` for setup and `expectedTurn` for moves, acknowledgement and ending actions. A stale request or wrong acting side is refused with a native RangeError. These counters help the host reject delayed actions; the host still owns player authentication.

## Keep the handoff screen

`pass` hides the board while the device changes hands. Call `acknowledgePass` for the named next player before showing that side’s board. The five modes share this lifecycle. A language or material update should retain the current match rather than creating another setup. The native player implements the same transitions.
