# Phase 1 — Webview Post Polish (Inline Feel)

## Goal
Ensure the post reads as a polished inline Devvit Web game:
- preview copy is inviting
- post creation flow is reliable

## Files touched
- `src/server/index.ts`
- (optional) `src/client/style.css` (loading states)

## Steps
1) Review server preview builder:
   - Keep preview lightweight (`<vstack>` and `<text>` only).
   - Update copy to match carnival theme (no heavy visuals).
2) Verify menu item creation:
   - Ensure the menu endpoint creates a post consistently.
3) Add a client-side loading hint (optional):
   - If Three takes a moment, ensure start panel appears instantly.

## Automated tests
- `npm run check`
- `npm run test`
- `npm run build`

## Manual tests
- Create a post from menu and confirm preview shows and post loads.

## Success checklist
- [ ] Preview copy matches carnival theme.
- [ ] No breaking changes to endpoints.
- [ ] Post creation is reliable in playtest.

## File success checklists
### `src/server/index.ts`
- [ ] No route signature changes.
- [ ] Preview remains lightweight.
- [ ] No new external fetches.
