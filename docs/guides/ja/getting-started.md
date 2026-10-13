---
title: はじめに
section: tutorial
order: 1
description: 標準の隠し挟み将棋を配置し、最初の移動を確かめます。
---

## 両側の配置を完了する

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

各ゲームの入口から、その対局を作り、許可された自陣に全ての駒を配置します。片側が配置し、端末を渡してもう片側も配置し、最初の側に戻して対局を始めます。操作を受け付けた後は、返された状態を保ちます。完全な状態と駒一覧は、判定する側の情報です。

## 公開する入口を選ぶ

規則にはゲームの入口を使います。`/views` はプレイヤーや観戦者の表示、`/draw` は SVG、`/play` は同じ端末で交代するプレイヤーです。`/trusted` はホストの保存です。主な入口の公開再生は、非公開の情報を取り除いた別の記録です。[表示](redacted-views.md)と[標準のプレイヤー](native-player.md)も参照してください。
