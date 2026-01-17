# PHASE 3 AGENT — Background Integration (X-only Parallax)

## Mission
Replace neon parallax with carnival parallax **during gameplay** and enforce **horizontal-only** motion.

## Read first (required)
- `planDartv3.2/01_CONTRACTS/RENDER_CONTRACT.md`
- `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
- `planDartv3.2/03_ARCHITECTURE/PARALLAX_MODEL.md`
- `planDartv3.2/04_PHASES/PHASE_3_BACKGROUND_INTEGRATION_X_ONLY.md`

## Files to change
- `src/client/game/DartGame.ts`
- `src/client/game/neonTextures.ts` (optional: keep but ensure it is not the default)
- `src/client/game/carnivalTextures.ts` (only if fixes needed)

## Forbidden changes
- No changes to scoring, hit detection, server determinism.
- No changes to API route shapes.

## Implementation steps
1) **Import carnival generator**
- In `DartGame.ts`, replace the neon texture import:
  - from `makeNeonLayerTexture` to `makeCarnivalLayerTexture`

2) **Replace background construction**
- In the constructor's "Create neon parallax background" block:
  - Replace both `makeNeonLayerTexture(...)` calls with carnival layer calls.
  - Use a deterministic seed strategy:
    - Prefer server-provided seed if already available in state; otherwise use `state.gameId` hashed to uint32.
    - If no state/seed available at construction time, use a fixed seed (e.g. 1337) until state arrives.

3) **Tune repeat**
- Keep:
  - `wrapS = THREE.RepeatWrapping`
  - `wrapT = THREE.RepeatWrapping`
- Tune:
  - `repeat.set(repeatX, repeatY)` so the post looks good at wide aspect.

4) **Enforce X-only parallax in the loop**
- In the render loop:
  - Remove all writes to `bgTex1.offset.y` and `bgTex2.offset.y`.
  - Update ONLY `offset.x`.

5) (Optional) **Aim-influenced drift**
- If used, keep amplitude very small:
  - total additional offset <= 0.03
- Must remain X-only.

## Automated tests (must pass)
- `npm run check`
- `npm run test`
- `npm run build`

## Scripted guard check
Run:
- `bash agentsDartv3.2/03_SCRIPTS/check_no_offset_y.sh .`

## Manual test
- Start a game and let it idle 30 seconds.
- Confirm:
  - carnival background is visible
  - drift is horizontal only
  - no vertical movement

## Phase 3 success checklist
- [ ] Carnival layers visible in gameplay.
- [ ] **No** `texture.offset.y` writes anywhere in gameplay background code.
- [ ] Parallax feels right-to-left only.
- [ ] Automated tests pass.
- [ ] Guard script passes.

## Phase 3 file success checklist
### `src/client/game/DartGame.ts`
- [ ] No `texture.offset.y = ...` assignments.
- [ ] Background uses `makeCarnivalLayerTexture`.
- [ ] Texture wrapping/repeat set.
- [ ] Board readability preserved.
