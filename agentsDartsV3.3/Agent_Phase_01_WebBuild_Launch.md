# Agent Prompt — Phase 01: Web Build + Bundled Launch

Copy/paste this entire prompt into ChatGPT Agent Mode.

---

You are a **Devvit Web + Vite build engineer**. Execute **Phase 1 only** from the plan.

## Plan reference
Use `planDartsV3.3/00_CONTRACTS_AND_IMMUTABLES.md` and `planDartsV3.3/Phase_01_WebBuild_Launch.md` as the source of truth.

## Input
Repo zip is available locally: `/mnt/data/redartulousV3.3.zip`

## Output
Produce `redartulousV3.3.1.zip`.

## Phase 1 allowed file changes (ONLY)
- `vite.config.ts` (create/update)
- `src/client/index.html` (fix script path only)
- `src/client/launch.html` (create)
- `src/launch.ts` (create)
- `package.json` (ONLY if required to add/fix a client build script)

## Forbidden
- No server code changes
- No gameplay logic changes
- Do not hand-edit build outputs in `public/` (only verify after build)

## Step-by-step tasks

### 0) Audit (must do first)
1. Unzip the repo.
2. Print a concise tree:
   - `vite.config.*`
   - all `index.html` and `launch.html` paths
   - `src/client/` and `src/`
   - `public/` (if present)
3. Identify the current failure mode (likely: Vite cannot find the configured entry html; incorrect script path; launch is not bundled).

### 1) Fix/implement correct HTML sources
1. Ensure `src/client/index.html` exists and references the *real* client entry:
   - must be `<script type="module" src="/src/client/main.ts"></script>`
   - NOT `/main.ts`
2. Create `src/client/launch.html` as a Vite source HTML.
   - include a root element and `script type="module" src="/src/launch.ts"`

### 2) Implement `src/launch.ts`
- Render a carnival-themed launch screen (Option A vibe: night gradient + bulbs/bokeh feel).
- Add a prominent button labeled **Play Now**.
- On click, call: `requestExpandedMode(event, "game")` from `@devvit/web/client`.

### 3) Fix Vite config
- Ensure Vite multi-page build outputs to `public/`.
- Configure rollup inputs to the *actual* source html files:
  - `src/client/index.html`
  - `src/client/launch.html`
- Ensure the build produces:
  - `public/index.html`
  - `public/launch.html`
  - hashed assets in `public/assets/`

### 4) Gate (must pass)
Run the client build gate from the plan:
- If the repo has `npm run build:client`, use it.
- Otherwise run `npm run build` if it is the client build.

After build:
- Verify `public/index.html` exists and references `./assets/index-*.js` (and css if present).
- Verify `public/launch.html` exists and references `./assets/launch-*.js` (and css if present).
- Verify `public/launch.html` does **not** reference `/src/launch.ts`.

### 5) Package output
Zip the repo as `redartulousV3.3.1.zip`.

## Final response requirements
- Provide the downloadable zip.
- List all changed/created files.
- Paste full contents of each changed/created file.
