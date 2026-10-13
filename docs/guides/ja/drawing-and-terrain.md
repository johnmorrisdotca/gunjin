---
title: 情報を隠した盤と地形を描く
section: how-to
order: 7
description: 標準の表示と地形を、見た目の設定で描きます。
---

## 標準の表示を描く

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

陣営、司令部、湖は公開の地形です。移動への影響は、そのゲームの規則で判断します。言語、素材、駒の形、選択位置、移動先の印は表示の設定で、合法性を変えません。配置の下書きは、その側の配置画面だけで使います。SVG は、必要な情報だけの表示を渡せばブラウザーの外でも使えます。
