# PHASE 2 AGENT — Carnival Texture Generators

## Mission
Implement procedural background generators for **Carnival Option A (Night Midway)**.

## Read first (required)
- `planDartv3.2/01_CONTRACTS/ASSET_CONTRACT.md`
- `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
- `planDartv3.2/03_ARCHITECTURE/CARNIVAL_BACKGROUND_SPEC.md`
- `planDartv3.2/04_PHASES/PHASE_2_CARNIVAL_TEXTURE_GENERATORS.md`

## Files to add
- **ADD** `src/client/game/carnivalTextures.ts`

## Design constraints
- Must export: `makeCarnivalLayerTexture(layer: number, seed: number): THREE.CanvasTexture`
- Must be deterministic:
  - Do not call `Math.random()` unless it is seeded/controlled (prefer a tiny local seeded RNG).
- Canvas max size: `1024 x 1024`.
- No network fetches; no external image assets.
- Texture should be tile-friendly left-to-right (repeat-x).

## Suggested layer meanings
Use the same `layer` IDs everywhere:
- `1`: Sky gradient + haze
- `2`: Silhouettes (ferris wheel / coaster)
- `3`: Bokeh string lights band
- `4`: Muted tent stripes / arcs
- `5`: Foreground vignette / fence silhouettes

## Implementation steps
1) Create a small deterministic RNG
- Example: xorshift32 / mulberry32 style.
- Provide helpers:
  - `rand()` -> [0,1)
  - `randRange(min,max)`
  - `randInt(min,max)`

2) Implement drawing primitives
- Use `CanvasRenderingContext2D`.
- Prefer large, soft shapes; low contrast.
- Avoid tiny high-frequency detail (will shimmer in motion).

3) Implement each layer
- **Layer 1 (sky)**: vertical gradient + subtle noise dots at low alpha.
- **Layer 2 (silhouette)**: simple wheel arcs + coaster lines as dark shapes.
- **Layer 3 (bokeh)**: circles w/ multiple alpha rings to fake blur; warm palette.
- **Layer 4 (tents)**: broad stripe arcs / diagonal stripes with low alpha.
- **Layer 5 (vignette/fence)**: radial vignette + occasional post silhouettes.

4) Return a `THREE.CanvasTexture`
- `const tex = new THREE.CanvasTexture(canvas);`
- Ensure `tex.colorSpace = THREE.SRGBColorSpace` (if the project uses it elsewhere).
- Set `tex.needsUpdate = true`.

## Tests (must pass)
- `npm run check`
- `npm run build`

## Phase 2 success checklist
- [ ] `makeCarnivalLayerTexture` exists and exports.
- [ ] Deterministic output for same (layer, seed).
- [ ] Canvas size <= 1024.
- [ ] Layers look carnival-like when applied to planes.
- [ ] `npm run check` + `npm run build` pass.

## Phase 2 file success checklist
### `src/client/game/carnivalTextures.ts`
- [ ] Exports `makeCarnivalLayerTexture`.
- [ ] No unseeded randomness.
- [ ] No runtime fetches.
- [ ] Avoids per-call heavy allocations beyond the canvas.
