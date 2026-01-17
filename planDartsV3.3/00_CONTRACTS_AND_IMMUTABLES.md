# 00 — Contracts and Immutables (Redartulous Darts V3.3)

## Objective
Ship a Devvit Web interactive post that feels like a released/featured game:

- A **styled carnival launch experience** appears immediately (no generic “Launch App” wall-of-text feel)
- Clicking **Play Now** opens **expanded gameplay**
- Gameplay shows **Carnival Option A** parallax background with **X-only** motion (no diagonal)

## Non-negotiable immutables
1. **Devvit entrypoints**
   - `default` → `launch.html`
   - `game` → `index.html`
2. Menu endpoint must create posts with `entry: "default"`.
3. `public/` is **build output only**. Do not hand-edit it as a source of truth.
4. Launch screen must be **bundled by Vite** (no raw HTML that uses bare imports like `@devvit/web/client`).
5. Gameplay must not regress:
   - Existing API endpoints remain compatible
   - Scoring, state, leaderboard behavior remain functionally equivalent
6. **Carnival parallax is horizontal-only**:
   - Any `offset.y` must remain `0`
   - No drift/tilt/diagonal coupling

## Definition of Done (global)
- `npm run check` passes
- `npm run test` passes
- `npm run build` passes
- A newly created post shows a **styled launch** screen (not a generic placeholder)
- Clicking Play opens gameplay (expanded mode)
- Gameplay shows carnival background with X-only parallax

## Repo conventions
- All edits must be explicit and complete (no partial snippets in implementation docs).
- In each phase: only modify files listed as allowed.
- Every phase must end by running its gate command(s) successfully.
