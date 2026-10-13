---
title: Choose public replay or trusted storage
section: how-to
order: 5
description: Share redacted records while keeping role-bearing storage private.
---

## Encode a shareable record

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

Public replay omits private setups and piece ids and keeps only combat ranks published by the mode. Trusted storage contains the authoritative match, including secret roles, and belongs to a trusted host. Do not substitute one format for the other. Both decoders return null for refused or unsupported data.

## Validation has a scope

The public decoder validates a shareable record’s shape and allowed information; it cannot reconstruct hidden setups to rejudge every battle. Trusted decoding checks stored structure and pieces, rather than replaying every historical move or authenticating the sender. Retain the host’s trust/authentication boundary and original mode/version.
