# PHASE 1 AGENT — Webview Post Polish (Inline Feel)

## Mission
Polish the **inline post experience** (preview copy + reliable post creation flow) without changing API contracts.

## Read first (required)
- `planDartv3.2/01_CONTRACTS/API_CONTRACT.md`
- `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
- `planDartv3.2/04_PHASES/PHASE_1_WEBVIEWPOST_POLISH.md`
- `planDartv3.2/03_ARCHITECTURE/WEBVIEWPOST_OVERVIEW.md`

## Allowed files to change
- `src/server/index.ts`
- (optional) `src/client/style.css`

## Forbidden changes
- Do not rename or remove endpoints.
- Do not change shared types (`src/shared/types/*`).
- Do not change scoring math or throw validation.

## Implementation steps
1) **Audit current preview**
   - In `src/server/index.ts`, find the preview renderer / preview builder for the custom post type.
   - Ensure the preview uses lightweight Blocks only (text/vstack), not heavy images/canvas.

2) **Update preview copy to Carnival theme**
   - Copy goals:
     - Short, readable at small sizes
     - Invites play
     - Mentions "Carnival Midway" vibe (bulbs / big-top / midway)
   - Do not add new external assets.

3) **Verify menu post creation**
   - In `src/server/index.ts`, locate the menu endpoint referenced by `devvit.json`:
     - `menu.items[].endpoint` should map to a server endpoint.
   - Confirm it creates the post correctly and sets the correct post type.

4) (Optional) **Client loading hint**
   - Only if there is a visible "blank" moment while Three initializes:
     - add CSS for a quick loading state that appears instantly.
   - Do not introduce external font loads.

## Tests (must pass)
- `npm run check`
- `npm run test`
- `npm run build`

## Manual test
- `npx devvit playtest`
- Create a new post from the menu item.
- Confirm:
  - preview shows carnival-themed text
  - the post renders inline and the client loads

## Phase 1 success checklist
- [ ] Preview copy updated and still lightweight.
- [ ] Menu post creation still works.
- [ ] No contract changes.
- [ ] All automated tests pass.
- [ ] Playtest post renders inline.

## Phase 1 file success checklist
### `src/server/index.ts`
- [ ] No route signature changes.
- [ ] Preview remains lightweight.
- [ ] No new external fetches.
