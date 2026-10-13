---
title: 投了と合意の引き分け
section: how-to
order: 6
description: 終了の操作を、標準の側と手番で行います。
---

## 提案し、渡し、確認して受け入れる

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

引き分けの提案では端末を渡します。受け取った側が確認し、標準の手番で受け入れるか断ります。合意の引き分けは winner が null です。投了は相手の勝ちです。古い手番や違う側の終了操作は受け付けません。表示の文字や結果の申告だけで終了せず、ホストの標準の流れを使います。
