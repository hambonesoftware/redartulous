# Phase 1 — Fix Web Build + Add Launch Entry (Single Session)

## Objective
Create a **real, bundled** `launch.html` built by Vite, and ensure Vite outputs:

- `public/launch.html` (built, hashed assets)
- `public/index.html` (built, hashed assets)

This phase ends when the client build succeeds and both HTML outputs exist.

## Allowed file changes (ONLY)
- `vite.config.ts` (create/update)
- `src/client/index.html` (fix script path only)
- `src/client/launch.html` (create)
- `src/launch.ts` (create)
- `package.json` (ONLY if client build script is missing/incorrect)

## Forbidden changes
- No server code changes in this phase
- No gameplay logic changes in this phase
- No editing built files in `public/` (except to confirm outputs)

## Required implementation

### A) Vite multi-page build
Configure Vite `rollupOptions.input` to point to your **actual** source HTML paths.

**Source-of-truth rule:** HTML sources must NOT live in `public/`.

Implementation rules:
- `build.outDir = "public"`
- `build.emptyOutDir = true`
- `build.assetsDir = "assets"`
- `rollupOptions.input` must produce both `launch.html` and `index.html` in `public/`.

### B) Fix gameplay HTML entry script path
If `src/client/index.html` contains:

```html
<script type="module" src="/main.ts"></script>
```

It must become:

```html
<script type="module" src="/src/client/main.ts"></script>
```

### C) Create bundled launch page
Create `src/client/launch.html` that mounts a container and loads:

```html
<script type="module" src="/src/launch.ts"></script>
```

### D) Launch behavior
`src/launch.ts` must render a carnival themed launch UI with a “Play Now” button that calls:

```ts
requestExpandedMode(event, "game")
```

Hard requirement:
- `@devvit/web/client` must be imported in **TypeScript** (bundled), not directly from raw HTML.

## Phase gate (must pass)
Run exactly one of the following, depending on project scripts:

- `npm run build:client` **OR**
- `npm run build` (only if it is the client build)

## Phase 1 success checklist
- [ ] Client build succeeds on Windows
- [ ] `public/launch.html` exists and references hashed assets in `public/assets/`
- [ ] `public/index.html` exists and references hashed assets in `public/assets/`
- [ ] `public/launch.html` does **not** reference `/src/launch.ts` directly
- [ ] No manual edits required in `public/`

## Evidence to include in completion report
- Command run + exit code
- `dir public\index.html` and `dir public\launch.html` outputs
- A short note confirming both HTML outputs reference `./assets/...` hashed files
