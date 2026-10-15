---
title: 5つの規則から選ぶ
section: how-to
order: 2
description: 各ゲームの駒・地形・移動・戦闘の規則をそろえます。
---

## そのゲームの駒一覧を読む

```ts
import { hasamiRoster } from "@johnmorrisdotca/gunjin/hasami";
import { luzhanqiMiniRoster } from "@johnmorrisdotca/gunjin/luzhanqi-mini";
import { salpakanRoster } from "@johnmorrisdotca/gunjin/salpakan";
import { STRATEGO_LITE_RULES } from "@johnmorrisdotca/gunjin/stratego-lite";
import { GUNJIN_SHOGI_RULES } from "@johnmorrisdotca/gunjin/gunjin-shogi";
console.log(hasamiRoster(7).length,luzhanqiMiniRoster().length,salpakanRoster().length,STRATEGO_LITE_RULES.mode,GUNJIN_SHOGI_RULES.mode);
```

隠し挟み将棋は7×7と9×9です。他のゲームは、それぞれの大きさを使います。駒一覧と配置は、そのゲームの規則に従います。陸戦棋ミニの旗は司令部、地雷は後列、爆弾は前列以外です。地形と戦闘の結果も、そのゲームの規則です。

## 規則の範囲を保つ

ここで定義した形式や将棋部ルールを実装します。全ての大会の規則を実装したものではありません。保存には、ゲーム、大きさ、版を保ちます。完全な[規則](../../RULES.md)と[APIの概要](../../API.md)は、そのまま残しています。
