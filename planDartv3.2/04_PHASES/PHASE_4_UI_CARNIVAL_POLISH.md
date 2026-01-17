# Phase 4 — UI Carnival Polish

## Goal
Make UI read as **Carnival Midway** (warm bulbs + subtle stripes) while staying clean and readable.

## Files changed
- `src/client/style.css`
- `src/client/main.ts`

## Steps
1) Start panel poster vibe
- Keep existing DOM; only adjust copy + CSS.
- Title glow: warm gold (soft), not neon.
- Add faint stripe accent or starburst behind title (low opacity).

2) HUD + overlays palette
- Keep layout/behavior exactly the same.
- Update colors to muted reds + warm golds; keep strong contrast for text.
- Ensure leaderboard + summary overlays remain readable over busy backgrounds.

## Automated tests
- `npm run check`
- `npm run build`

## Manual tests
- Desktop: resize narrow/wide; confirm no overlap.
- Mobile: confirm Start button is reachable and text is readable.

## Success checklist
- [ ] Start panel feels like a carnival poster.
- [ ] HUD is readable at small embed sizes.
- [ ] Overlays don’t clash with the background.

## File success checklists
### `src/client/main.ts`
- [ ] No gameplay logic changes (only copy/DOM/CSS hooks).
- [ ] Start panel still renders instantly.

### `src/client/style.css`
- [ ] Colors updated to carnival palette.
- [ ] No text becomes low-contrast on dark backgrounds.
- [ ] Uses only local CSS (no external font fetches).
