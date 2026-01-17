# PHASE 7 AGENT — Packaging + Release

## Mission
Ship `redartulousV3.2.zip` with clear release notes, clean build, and verified playtest.

## Read first (required)
- `planDartv3.2/04_PHASES/PHASE_7_PACKAGING_AND_RELEASE.md`
- `planDartv3.2/07_TESTS/MANUAL_TEST_SCRIPT.md`

## Files to change
- `CHANGELOG.md`

## Implementation steps
1) Update `CHANGELOG.md`
- Add a **v3.2** entry describing:
  - Carnival Midway background (Option A)
  - Parallax is X-only
- Do not rewrite prior entries.

2) Required tests (must pass)
- `npm run check`
- `npm run test`
- `npm run build`

3) Playtest smoke
- `npx devvit playtest` (or repo dev script)
- Create a new post from the menu item.
- Confirm:
  - post renders inline
  - background is carnival
  - parallax is horizontal-only

4) Package
- Create `redartulousV3.2.zip` from the project root.
- Include source + configs + any required build output (match prior release packaging style in repo).

## Phase 7 success checklist
- [ ] Changelog has v3.2 entry.
- [ ] All tests pass.
- [ ] Playtest works.
- [ ] Zip produced and named correctly.
