# PHASE 0 AGENT — Baseline Audit + Freeze

## Mission
Establish a **clean baseline** on `redartulousV3.1.1` and freeze contracts/immutables before any code edits.

## Read first (required)
- `planDartv3.2/01_CONTRACTS/CONTRACTS.md`
- `planDartv3.2/01_CONTRACTS/API_CONTRACT.md`
- `planDartv3.2/01_CONTRACTS/RENDER_CONTRACT.md`
- `planDartv3.2/01_CONTRACTS/ASSET_CONTRACT.md`
- `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
- `planDartv3.2/04_PHASES/PHASE_0_BASELINE_AUDIT.md`

## Setup
1) Unzip `redartulousV3.1.1.zip` to a working folder.
2) In the project root, run:
   - `npm ci`
   - `npm run check`
   - `npm run test`
   - `npm run build`

All must complete with **zero errors**.

## Baseline verification tasks (no code changes)
1) Confirm inline Devvit Web posture:
   - Open `devvit.json` and verify:
     - `post.dir` points at the static build folder (currently `public`).
     - `post.entrypoints.default.entry` points at `index.html`.

2) Locate diagonal drift in gameplay background:
   - Open `src/client/game/DartGame.ts`.
   - Find the animation loop where `bgTex1/bgTex2` offsets are updated.
   - Record the exact line numbers that assign `texture.offset.y`.

3) Confirm background generator:
   - Open `src/client/game/neonTextures.ts`.
   - Confirm it is the source of background visuals in the constructor of `DartGame`.

4) Freeze API shapes:
   - Confirm `src/shared/types/api.ts` and `src/shared/types/game.ts` match the plan contract.
   - Do not edit these files.

## Deliverables for Phase 0
Create (or update) a short note file in your working output (not required to be committed) called `BASELINE.md` containing:
- Commands run and their results
- The exact `offset.y` assignment lines in `DartGame.ts`
- Confirmed `devvit.json` posture for inline web post
- Confirmed list of candidate files to change in v3.2

## Phase 0 success checklist
- [ ] `npm ci` passes.
- [ ] `npm run check` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] Exact `offset.y` write locations captured.
- [ ] `devvit.json` confirms inline Devvit Web posture.
- [ ] No source files modified in Phase 0.
