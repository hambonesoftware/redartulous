# PHASE 4 AGENT — UI Carnival Polish

## Mission
Update UI styling/copy so the game reads as **Carnival Midway** while preserving layout and gameplay behavior.

## Read first (required)
- `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
- `planDartv3.2/04_PHASES/PHASE_4_UI_CARNIVAL_POLISH.md`

## Files to change
- `src/client/style.css`
- `src/client/main.ts`

## Forbidden changes
- No changes to DartGame logic (scoring, throw, aim behavior)
- No external font or asset fetches

## Implementation goals
1) **Start panel = carnival poster vibe**
- Warm gold headline glow (soft)
- Subtle stripe/starburst accent behind title (very low opacity)
- Copy mentions "Carnival Midway" and darts

2) **HUD palette = warm + readable**
- Muted reds, warm gold, deep purples
- Maintain accessibility contrast (small embed sizes)

3) **Overlays remain clear**
- Leaderboard and summary panels must be readable over busy backgrounds:
  - add backdrop blur or translucent dark panels if already used

## Implementation steps
1) Identify the start screen elements in `main.ts` and their classes/ids.
2) Update copy text only (keep structure).
3) Update CSS variables / classes for:
   - buttons
   - headings
   - HUD chips
   - overlay panels
4) Confirm no changes to any client-server calls.

## Automated tests (must pass)
- `npm run check`
- `npm run build`

## Manual tests
- Desktop: narrow/wide resize; confirm nothing overlaps.
- Mobile: confirm Start button and HUD readable.

## Phase 4 success checklist
- [ ] Start panel reads like a carnival poster.
- [ ] HUD readable and not neon.
- [ ] Overlays readable.
- [ ] No gameplay logic changes.
- [ ] Automated tests pass.

## Phase 4 file success checklist
### `src/client/main.ts`
- [ ] Only copy/DOM hooks/CSS class changes.
- [ ] Start panel still renders instantly.

### `src/client/style.css`
- [ ] Carnival palette used.
- [ ] No external imports.
- [ ] No low-contrast text.
