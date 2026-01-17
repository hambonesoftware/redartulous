# Phase 3 — Carnival Option A Parallax in Gameplay (X-only) (Single Session)

## Objective
Integrate **Carnival Option A** background during gameplay with **horizontal-only parallax**.

This phase ends when build/test passes and the background appears during gameplay.

## Allowed file changes (ONLY)
- Gameplay client files used for rendering background/parallax (e.g. `src/client/**`)
- Asset files for the background (e.g. `src/client/assets/**` or your project’s equivalent)

## Forbidden changes
- No changes to API contracts / shared types unless unavoidable
- No diagonal movement in parallax (hard invariant)

## Required implementation

### A) Background layers (Option A)
Implement layers (back → front):
1. **Sky gradient + haze**
2. **Silhouette layer** (ferris wheel / coaster / tents)
3. **Bulb bokeh band** (blurred lights)
4. **Tent stripe shapes** (muted)
5. **Foreground vignette**

Design constraints:
- Keep contrast low behind the dartboard (board remains the hero)
- Put detail mostly in top third and edges; keep center behind board calmer

### B) Parallax must be X-only
All movement is driven by a single `parallaxX` scalar.

Rules:
- `layerX = base * speed`
- `layerY = 0` always
- no diagonal drift at any time

Recommended speed ratios (back → front):
- sky: `0.03`
- silhouettes: `0.08`
- bokeh: `0.14`
- tents/stripes: `0.22`
- vignette/foreground: `0.35`

Recommended amplitude:
- ±30px maximum total travel (small, subtle)

### C) Visual sanity checks
- Background should not overpower the aim/throw UI
- If you have a crosshair/aim circle overlay, it must remain clear on top
- Ensure performance remains smooth (no heavy overdraw)

## Phase gate (must pass)
- `npm run test`
- `npm run build`

## Phase 3 success checklist
- [ ] Carnival background visible during gameplay
- [ ] Parallax moves right-to-left only (no diagonal drift)
- [ ] `npm run test` passes
- [ ] `npm run build` passes

## Evidence to include in completion report
- Command outputs summary
- A short note describing where `parallaxX` is sourced and how Y is forced to 0
- Screenshot(s) or description of the background layers visible during play
