---
title: 端末を渡し、古い操作を受け付けない
section: how-to
order: 3
description: setupStep と turn を標準の対局の流れで使います。
---

## 見た手番を付けて移動する

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

配置には `expectedSetupStep`、移動や受け渡し、終了の操作には `expectedTurn` を使います。古い操作や違う側の操作は、標準の RangeError です。番号は遅れて届いた操作を取り除くためで、本人の確認はホスト側で行います。

## 受け渡しの画面を保つ

`pass` は、端末を渡す間、盤を隠します。次の側に盤を見せる前に、そのプレイヤーで `acknowledgePass` を呼びます。5つのゲームは、この流れを共有します。言語や素材を変えても、対局を作り直しません。標準のプレイヤーも、同じ流れを使います。
