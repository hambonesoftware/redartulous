# Phase 3 — Background Integration (X-only Parallax)

## Goal
Replace Neon parallax with Carnival parallax and enforce **horizontal-only** motion.

## Files changed
- `src/client/game/DartGame.ts`
- `src/client/game/neonTextures.ts` (optional: keep but no longer default)

## Steps
1) Swap generators:
   - Replace `makeNeonLayerTexture(...)` calls with `makeCarnivalLayerTexture(...)`.
2) Confirm wrapping + repeat:
   - `wrapS = RepeatWrapping`
   - `wrapT = RepeatWrapping`
   - `repeat.set(...)` tuned for wide posts
3) Fix parallax loop:
   - Remove all `offset.y = ...` updates.
   - Only update `offset.x`.
4) Optional: make drift depend partly on aim X:
   - small offset only (<= ~0.03)

## Automated tests
- `npm run check`
- `npm run test`
- `npm run build`

## Manual tests
- Let the post sit for 30 seconds:
  - confirm no vertical drift.

## Success checklist
- [ ] Carnival layers visible.
- [ ] Background moves only left/right.
- [ ] No diagonal drift.

## File success checklist
### `src/client/game/DartGame.ts`
- [ ] No `texture.offset.y` writes.
- [ ] Two carnival background layers exist.
- [ ] Board remains readable.
