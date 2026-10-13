---
title: Troubleshooting and FAQ
section: troubleshooting
order: 9
description: Interpret hidden nulls, refused setups, stale turns and decoder scope.
---

## Hidden information and invalid requests

- Null `pieces` means the lifecycle hides the board during setup/pass.
- Null opponent `kind` means the role is hidden, and the id is absent.
- Null `ownSetup` means the view is outside setup.
- Null winner means an agreed draw; an absent result means no result exists yet.
- Null decoding means the format/structure was refused or unsupported.
- A wrong roster, illegal placement, stale setup step, stale turn or wrong side throws the native RangeError.

## Keep modes and storage distinct

Use the mode’s real roster and terrain restrictions. Full trusted storage does not become public by changing its property name. A redacted replay cannot restore secret setups. A hotseat handle exposes only its redacted view/replay. Destroy the mount when removing its host, and retain the [complete rules](../RULES.md) and [API overview](../API.md) when integrating.
