# PHASE 5 AGENT — Determinism + Performance Guardrails

## Mission
Verify the carnival background changes do **not** impact determinism, scoring, or performance.

## Read first (required)
- `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
- `planDartv3.2/04_PHASES/PHASE_5_DETERMINISM_AND_PERF_GUARDS.md`

## Scope
This phase is primarily verification + micro-optimizations if needed.

## Files to review (likely unchanged)
- `src/server/dartMath.ts`
- `src/server/gameStore.ts`
- `src/shared/types/api.ts`
- `src/shared/types/game.ts`

## Files to adjust (only if needed)
- `src/client/game/carnivalTextures.ts`
- `src/client/game/DartGame.ts`

## Verification steps
1) Confirm no scoring math changed
- Diff against baseline for server math/validation modules.

2) Confirm no unseeded randomness influences gameplay
- Visual-only randomness in background is allowed, but must be deterministic for the same seed.

3) Confirm background generation is not per-frame
- Background canvases/textures must be created once in constructor/init, not inside the render loop.

4) Confirm no per-frame allocations in parallax loop
- Updating `texture.offset.x` is fine.
- Avoid creating new objects/arrays each frame.

5) Confirm texture sizes
- Ensure max 1024 and only a small number of layers are created.

## Tests (must pass)
- `npm run check`
- `npm run test`
- `npm run build`

## Manual perf smoke
- In playtest, idle on the post for 60s.
- Confirm no obvious stutter.

## Phase 5 success checklist
- [ ] No changes to server scoring/hit validation.
- [ ] No gameplay-affecting randomness.
- [ ] Background generation happens once.
- [ ] No per-frame allocations added.
- [ ] Automated tests pass.
