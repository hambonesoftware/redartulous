# Phase 2 — Carnival Texture Generators

## Goal
Create procedural CanvasTexture generators for Carnival Option A.

## Files added/changed
- **ADD** `src/client/game/carnivalTextures.ts`
- (optional) `src/client/game/random.ts` (seeded helpers) OR keep local helpers inside carnivalTextures.ts

## Steps
1) Create `makeCarnivalLayerTexture(layer, seed)` that returns `THREE.CanvasTexture`.
2) Implement drawing primitives:
   - Sky gradient base
   - Silhouettes (simple arcs/lines)
   - Bokeh circles (blurred; can fake blur by drawing multiple alpha rings)
   - Tent stripe arcs (low alpha)
   - Vignette (radial gradient)
3) Ensure textures are tile-friendly:
   - design so left/right edges blend reasonably

## Tests
- `npm run check`
- `npm run build`

## Success checklist
- [ ] Generator returns a valid `CanvasTexture`.
- [ ] Texture looks carnival-like when applied to a plane.
- [ ] No runtime fetches.

## File success checklist
### `src/client/game/carnivalTextures.ts`
- [ ] Exports `makeCarnivalLayerTexture`.
- [ ] Uses deterministic seeded RNG (no Math.random without seed).
- [ ] Canvas size <= 1024.
