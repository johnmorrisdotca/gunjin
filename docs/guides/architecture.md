---
title: How rules, views and the player fit together
section: explanation
order: 11
description: Preserved architecture and the authoritative/redacted boundaries.
---

## Architecture

```text
src/
├── draw.ts
├── gunjin-shogi.ts
├── hasami.ts
├── index-core.ts
├── index.ts
├── luzhanqi-mini.ts
├── match.ts
├── play.ts
├── replay.ts
├── rules/
│   ├── board.ts
│   ├── gunjinShogi.ts
│   ├── hiddenHasami.ts
│   ├── index.ts
│   ├── luzhanqiMini.ts
│   ├── salpakan.ts
│   ├── strategoLite.ts
│   └── types.ts
├── salpakan.ts
├── stratego-lite.ts
├── strings.ts
├── style.ts
├── trusted.ts
├── types.ts
└── views.ts
```

The engine is `match.ts` and the five modules under `rules/`: each rule module says what a mode's board is, what its roster is, where a piece may go and how a fight ends, and `match.ts` is the one lifecycle that applies them. The entry files at the top are thin: they re-export a mode's calls under its own names. `views.ts` and `replay.ts` are the only code that decides what may be seen, and `draw.ts` and `play.ts` take only what they produce.

## Documentation

The shared generator reads public TypeScript declarations and checks native examples. It creates paired references/guides, Markdown twins, llms files and a local search index.
