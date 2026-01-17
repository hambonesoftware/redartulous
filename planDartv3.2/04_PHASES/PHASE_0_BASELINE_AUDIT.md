# Phase 0 — Baseline Audit + Freeze

## Goal
Confirm v3.1.1 baseline behavior and freeze contracts/immutables before changes.

## Files to inspect (no changes yet)
- `src/client/game/DartGame.ts` (background + parallax update loop)
- `src/client/game/neonTextures.ts` (current background generator)
- `src/server/index.ts` (preview + endpoints)
- `src/shared/types/api.ts`, `src/shared/types/game.ts`
- `devvit.json`, `package.json`

## Steps
1) Run required automated tests:
   - `npm ci`
   - `npm run check`
   - `npm run test`
   - `npm run build`
2) Read the existing parallax code:
   - Locate where `bgTex1/bgTex2` offsets are updated.
3) Confirm the current issue:
   - verify `offset.y` is being animated (diagonal drift).
4) Confirm webview-post posture:
   - verify `devvit.json` `post.dir=public`.

## Success checklist
- [ ] All automated tests pass at baseline.
- [ ] You have identified the exact lines updating `texture.offset.y`.
- [ ] Contracts/immutables are copied forward and agreed.

## Rollback
No changes in this phase.
