# Agent Prompt — Phase 03: Carnival Option A Parallax (X-only)

Copy/paste this entire prompt into ChatGPT Agent Mode.

---

You are a **front-end game rendering** engineer for Redartulous. Execute **Phase 3 only** from the plan.

## Plan reference
Use `planDartsV3.3/00_CONTRACTS_AND_IMMUTABLES.md` and `planDartsV3.3/Phase_03_Carnival_Parallax.md` as the source of truth.

## Input
Repo zip is available locally: `/mnt/data/redartulousV3.3.2.zip` (output of Phase 2). If not present, use the latest available.

## Output
Produce `redartulousV3.3.3.zip`.

## Phase 3 allowed file changes (ONLY)
- Client gameplay rendering files under `src/client/**` that control background rendering/parallax
- Background assets under the project's existing asset pipeline (do not invent a new pipeline)

## Forbidden
- No server API changes unless absolutely required
- Do not change shared API contracts unless unavoidable
- Parallax must be **X-only** (hard invariant): no offset.y drift ever

## Step-by-step tasks

### 0) Audit
1. Unzip repo.
2. Identify where the board scene/background is drawn:
   - locate any existing background textures, board textures, or render loop
   - locate any existing parallax logic

### 1) Implement Carnival Option A background
- Add layered background elements (sky gradient + silhouettes + bokeh band + tent stripes + vignette).
- Ensure the center behind the dartboard is low-contrast to keep readability.

### 2) Implement horizontal-only parallax
- Drive all parallax from a single scalar `parallaxX`.
- Apply per-layer `speed` multipliers.
- Ensure Y is always fixed at 0:
  - `offset.y = 0`
  - no camera tilt coupling

### 3) Gates (must pass)
Run:
- `npm run test`
- `npm run build`

Fix until both pass.

### 4) Package output
Zip as `redartulousV3.3.3.zip`.

## Final response requirements
- Provide the downloadable zip.
- List all changed/created files.
- Paste full contents of each changed/created file.
