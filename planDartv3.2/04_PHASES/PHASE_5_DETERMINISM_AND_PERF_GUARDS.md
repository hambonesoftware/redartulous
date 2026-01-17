# Phase 5 — Determinism + Performance + Input Guardrails

## Goal
Make sure the new background does not impact determinism or FPS.

## Files likely unchanged (verify)
- `src/server/dartMath.ts`
- `src/server/gameStore.ts`
- `src/shared/types/*`

## Steps
1) Confirm no gameplay code changed.
2) Confirm background canvas size reasonable (<= 1024).
3) Ensure background generation happens once (constructor), not per-frame.
4) Ensure no per-frame allocations in background update loop.

## Tests
- `npm run check`
- `npm run test`
- `npm run build`

## Success checklist
- [ ] Score harness unchanged / passes.
- [ ] No lag introduced.
- [ ] Touch aim works.
