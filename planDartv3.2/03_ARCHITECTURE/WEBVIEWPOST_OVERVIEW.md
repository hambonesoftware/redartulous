# Webview Post Overview (Devvit Web)

Redartulous already uses the Devvit Web pattern:
- `devvit.json` has `post.dir = public` and `entrypoints.default.entry = index.html`
- Client bundle is built by Vite into `public/assets/*`
- Server is built by tsup into `dist/server/index.cjs`

## v3.2 goal
- Keep this posture.
- Improve the "released game" feel by:
  - strong poster-like start panel
  - lightweight preview copy
  - smooth, tasteful parallax

## Key files
- Post hosting config: `devvit.json`
- Client entry: `src/client/main.ts`, `src/client/index.html`, `src/client/style.css`
- Gameplay render: `src/client/game/DartGame.ts`
- Server + preview: `src/server/index.ts`
