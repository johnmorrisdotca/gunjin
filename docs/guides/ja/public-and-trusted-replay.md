---
title: 公開再生とホストの保存を選ぶ
section: how-to
order: 5
description: 非公開の階級を含む保存と、公開の記録を分けます。
---

## 共有する記録を作る

```ts
import { createHasamiMatch,hasamiRoster,submitHasamiSetup } from "@johnmorrisdotca/gunjin/hasami";
import { acknowledgePass } from "@johnmorrisdotca/gunjin/gunjin-shogi";
const home=(player:0|1)=>hasamiRoster(7).map((kind,x)=>({kind,x,y:player===0?6:0}));
let match=createHasamiMatch({width:7,height:7});
match=submitHasamiSetup(match,0,home(0),match.setupStep);
match=acknowledgePass(match,1,match.turn);
match=submitHasamiSetup(match,1,home(1),match.setupStep);
match=acknowledgePass(match,0,match.turn);
import { encodePublicReplay,decodePublicReplay } from "@johnmorrisdotca/gunjin";
import { encodeTrustedMatch,decodeTrustedMatch } from "@johnmorrisdotca/gunjin/trusted";
console.log(decodePublicReplay(encodePublicReplay(match))?.mode);
console.log(decodeTrustedMatch(encodeTrustedMatch(match))?.phase);
```

公開再生は、非公開の配置と駒のIDを除き、規則が公開する戦闘の階級だけを保ちます。ホストの保存には、秘密の階級を含む完全な状態があります。形式を取り違えないでください。どちらも、受け付けない形式や未対応の版はnullです。

## 検証の範囲を確かめる

公開の読み取りは、共有する記録の形と情報を確認します。隠れた配置を復元して、全ての戦闘を判定し直すものではありません。ホストの読み取りも、保存の構造と駒を確認し、全ての履歴を再生したり送信者を認証したりはしません。ホストの信頼する境界、本人確認、元のゲームと版を保ちます。
