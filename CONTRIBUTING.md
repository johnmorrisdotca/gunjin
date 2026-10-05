# Contributing to Gunjin

Bug reports, ideas, and pull requests are welcome. For a substantial change,
please open an issue first so its scope and rules implications are clear.

## Reporting a bug

Open an [issue](https://github.com/johnmorrisdotca/gunjin/issues). Include
the mode, a sequence of moves or a replay when possible, what you expected,
what happened, and the browser or device if the issue concerns the player.
Do not include private setup data in a public report.

## Making a change

```sh
git clone https://github.com/johnmorrisdotca/gunjin
cd gunjin
pnpm install
pnpm check          # lint, types, and tests
pnpm build
pnpm test:package   # build, pack, install, and import package entries
pnpm test:demo      # build and exercise the demo in browsers
pnpm site           # build the demo and API reference
```

- **Rules stay pure.** Engine operations return new states and do not mutate
  their inputs. Keep DOM access in the player and drawing layers.
- **Keep secrets redacted.** Player views, spectator positions, and replay
  records must not expose unrevealed ranks. Test capture events and every mode's
  information boundaries.
- **Test rule changes with fixtures.** A changed rule needs a case that would
  have caught the previous behavior. Include both legal and illegal examples
  for changed move or setup validation.
- **Keep language complete.** Player-facing strings belong in English and
  Japanese in `src/strings.ts`.
- **Document each ruleset honestly.** Update `docs/RULES.md` whenever a rule
  changes, including deviations from its source or common variants.
- **Keep the family presentation shared.** Do not edit `demo/family.css` or
  `scripts/family-template.mjs` in this package. Package-specific presentation
  belongs in `demo/gunjin.css`.
- **Keep runtime dependencies at zero.** Use development dependencies only for
  tests, builds, or documentation.
- One focused change per pull request, with a line in `CHANGELOG.md` under
  *Unreleased* when behavior changes.

`SECURITY.md` and `CODE_OF_CONDUCT.md` are canonical family documents; their
copies in `scripts/community/` are checked together. Changes to that shared
text should be coordinated across the family.

## Before a release

```sh
pnpm check
pnpm test:package
pnpm test:demo
```

The package check validates the packed package's entry points. The browser
suite covers the demo at desktop and phone sizes. Maintainers update the
version and changelog together before a tagged release.

## Code of conduct

Participation follows the [Code of Conduct](CODE_OF_CONDUCT.md). To report a
security issue privately, see [SECURITY.md](SECURITY.md).
