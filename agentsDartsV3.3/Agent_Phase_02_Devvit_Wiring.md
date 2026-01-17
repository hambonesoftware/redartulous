# Agent Prompt — Phase 02: Devvit Wiring + Post Creation Entry

Copy/paste this entire prompt into ChatGPT Agent Mode.

---

You are a **Devvit configuration + server integration** engineer. Execute **Phase 2 only** from the plan.

## Plan reference
Use `planDartsV3.3/00_CONTRACTS_AND_IMMUTABLES.md` and `planDartsV3.3/Phase_02_Devvit_Wiring.md` as the source of truth.

## Input
Repo zip is available locally: `/mnt/data/redartulousV3.3.1.zip` (output of Phase 1). If not present, use `/mnt/data/redartulousV3.3.zip` and do not attempt Phase 1 changes.

## Output
Produce `redartulousV3.3.2.zip`.

## Phase 2 allowed file changes (ONLY)
- `devvit.json`
- `src/server/index.ts` or `src/server/index.tsx` (whichever contains the menu endpoint calling `submitCustomPost`)
- `README.md` or `RUN.md` (optional clarity only)

## Forbidden
- No Vite changes
- No gameplay/client changes

## Step-by-step tasks

### 0) Audit
1. Unzip the repo.
2. Print a concise view of:
   - `devvit.json` entrypoints
   - the menu endpoint handler file and the `submitCustomPost` call

### 1) Fix `devvit.json` entrypoints
Ensure:
- `post.dir` is `public`
- `entrypoints.default.entry` is `launch.html`
- `entrypoints.game.entry` is `index.html`

### 2) Fix menu post creation
In the menu endpoint, ensure `submitCustomPost` includes:
- `entry: "default"`

Do not add extra response keys that Devvit rejects.

### 3) Gate (must pass)
Run:
- `npm run check`

If check fails, fix within allowed scope only.

### 4) Package output
Zip the repo as `redartulousV3.3.2.zip`.

## Final response requirements
- Provide the downloadable zip.
- List all changed/created files.
- Paste full contents of each changed/created file.
