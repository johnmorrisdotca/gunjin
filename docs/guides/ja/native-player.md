---
title: 標準の同一端末のプレイヤーを表示する
section: how-to
order: 8
description: 独立した表示を保ち、公開する情報だけを通知します。
---

## 表示のハンドルを保つ

```ts no-run
import { createHasamiMatch } from "@johnmorrisdotca/gunjin/hasami";
import { mountGunjin } from "@johnmorrisdotca/gunjin/play";
const host=document.createElement("div");
document.body.append(host);
const board=mountGunjin(host,createHasamiMatch({width:7,height:7}),{language:"ja",onChange:position=>console.log(position.phase)});
board.set({material:"wood",pieceStyle:"tiles"});
console.log(board.view().phase,board.replay().length);
board.destroy();
```

ハンドルは、表示してよい情報、公開再生、見た目の更新、後始末を持ちます。変更や終了の通知にも、完全な状態ではなく公開の情報を渡します。同じ端末のプレイヤーは内部に両側の情報を持ち、受け渡しの画面を使います。離れた端末から対戦するホストは、認証と状態の管理を用意します。

## 現在の導入範囲を保つ

今回はルールのリンクと標準のプレイヤーを保ち、API の前に Docs を加えます。初期言語や途中の切り替えに従って、対応するページに進みます。標準の iframe や要素の埋め込みは、ファミリーの仕様に従い、引き続き延期しています。新しいビルダーや別の計算部分は作りません。
