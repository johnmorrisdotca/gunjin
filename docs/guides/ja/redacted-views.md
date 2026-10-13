---
title: 見る側に許された情報だけを表示する
section: how-to
order: 4
description: 判定する状態、プレイヤーの表示、観戦者の位置を分けます。
---

## 表示する前に情報を取り出す

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

自分の駒には、種類と ID があります。相手の種類は null で、ID はありません。観戦者には所属と座標だけを渡します。配置や受け渡しでは、盤の駒は null です。その側の配置も、配置中だけです。この null は意図して隠した情報で、盤の欠落ではありません。

## 公開する戦闘の情報

ログや再生には、その規則が公開する戦闘の階級だけが入ります。他の階級や配置は非公開です。描画には、完全な状態ではなく PlayerView を渡します。離れたホストから配信する場合、見る側の本人確認をします。完全な情報をすでに渡した後では、画面だけで秘密を守れません。
