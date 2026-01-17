# Phase 2 — Devvit Wiring + Post Creation Uses Launch Entrypoint (Single Session)

## Objective
Make Devvit load `launch.html` by default and ensure new posts are created using the launch entrypoint.

This phase ends when TypeScript passes and the config is internally consistent.

## Allowed file changes (ONLY)
- `devvit.json`
- `src/server/index.ts` or `src/server/index.tsx` (the menu endpoint that calls `submitCustomPost`)
- `README.md` or `RUN.md` (optional clarity)

## Forbidden changes
- No Vite changes in this phase
- No gameplay changes in this phase
- No changes to Redis/game endpoints besides adding `entry` on submit

## Required implementation

### A) devvit.json entrypoints
Must be:
- `post.dir = "public"`
- `entrypoints.default.entry = "launch.html"`
- `entrypoints.game.entry = "index.html"`

### B) submitCustomPost uses launch entry
In the menu endpoint that calls `reddit.submitCustomPost`, ensure:

```ts
await reddit.submitCustomPost({
  subredditName,
  title,
  preview,
  entry: "default",
} as any);
```

## Phase gate (must pass)
- `npm run check`

## Phase 2 success checklist
- [ ] `npm run check` passes
- [ ] `devvit.json` points to `public/launch.html` and `public/index.html`
- [ ] Menu post creation explicitly uses `entry:"default"`
- [ ] No other post config regressions

## Evidence to include in completion report
- Command output summary
- Snippet showing `devvit.json` entrypoints and the `submitCustomPost` call with `entry:"default"`
