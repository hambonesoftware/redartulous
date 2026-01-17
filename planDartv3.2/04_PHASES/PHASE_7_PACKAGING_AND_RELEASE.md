# Phase 7 — Packaging + Release

## Goal
Produce `redartulousV3.2.zip` and confirm it installs/runs as an inline Devvit Web post.

## Files changed
- `CHANGELOG.md`

## Steps
1) Update changelog
- Add a v3.2 entry: “Carnival Midway background (Option A) + horizontal-only parallax.”

2) Rebuild artifacts (must be clean)
- `npm run build`

3) Smoke test via Devvit playtest
- `npx devvit playtest`
- Create a new post from the menu.
- Confirm gameplay loads and background scrolls X-only.

4) Create final zip
- Zip the repo contents required for review/transfer (source + configs + built artifacts).
- Name: `redartulousV3.2.zip`.

## Automated tests (must be zero-error)
- `npm run check`
- `npm run test`
- `npm run build`

## Manual tests
- Run the manual script: `planDartv3.2/07_TESTS/MANUAL_TEST_SCRIPT.md`

## Success checklist
- [ ] `CHANGELOG.md` has a clear v3.2 entry.
- [ ] All automated tests pass.
- [ ] Playtest post loads reliably.
- [ ] Carnival background is active during gameplay.
- [ ] Parallax is horizontal-only.
- [ ] Final zip created with correct name.

## File success checklist
### `CHANGELOG.md`
- [ ] v3.2 entry present.
- [ ] No older entries removed/rewritten.
