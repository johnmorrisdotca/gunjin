---
title: Mount the native shared-device player
section: how-to
order: 8
description: Keep independent instances and expose only redacted handles/callbacks.
---

## Keep the mount handle

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

The handle exposes redacted views/replay, presentation updates and cleanup. Change/finish callbacks receive public data rather than a full authoritative match. The local hotseat player internally owns both sides and uses the handoff screen to manage shared-device privacy. A competitive remote host needs its own authenticated state boundary.

## Retain the existing adoption scope

This rollout adds Docs before API while retaining the Rules link and native player. Initial/live English/Japanese selection chooses the matching docs page. Native iframe/custom-element embed adoption remains deferred by the family standard; no new builder or competing engine is introduced.
