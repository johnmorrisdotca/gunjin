---
title: Select one of the five rule modes
section: how-to
order: 2
description: Keep each mode’s roster, terrain, movement and battle rules together.
---

## Read a mode’s own roster

```ts
import { hasamiRoster } from "@johnmorrisdotca/gunjin/hasami";
import { luzhanqiMiniRoster } from "@johnmorrisdotca/gunjin/luzhanqi-mini";
import { salpakanRoster } from "@johnmorrisdotca/gunjin/salpakan";
import { STRATEGO_LITE_RULES } from "@johnmorrisdotca/gunjin/stratego-lite";
import { GUNJIN_SHOGI_RULES } from "@johnmorrisdotca/gunjin/gunjin-shogi";
console.log(hasamiRoster(7).length,luzhanqiMiniRoster().length,salpakanRoster().length,STRATEGO_LITE_RULES.mode,GUNJIN_SHOGI_RULES.mode);
```

Hidden Hasami supports 7×7 and 9×9. The other modes use their native fixed sizes. Complete rosters and placement rules are mode-specific. Luzhanqi Mini’s flag belongs in headquarters, mines in the back row, and bombs away from the front. Terrain and battle resolution also belong to the selected mode.

## Preserve the rule scope

These are the package’s defined variants, including its club rules; they are not a claim to implement every tournament variation. Keep mode, board size and package version with saved records. The complete [rules](../RULES.md) and existing [API overview](../API.md) remain preserved.
