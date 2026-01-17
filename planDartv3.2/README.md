# planDartv3.2

This plan upgrades **Redartulous v3.1.1 → v3.2** by:

1) Confirming the project is an **inline Devvit Web post** ("webview post" feel: animated canvas/Three scene in-feed).
2) Replacing the Neon background with **Carnival Parallax Option A (Night Midway)** during gameplay.
3) Enforcing **horizontal-only parallax (right-to-left only)** — **no diagonal drift**.

> This plan is written to be executed by a follow-on `agentsV3.2.zip` (not included here).

## Inputs
- Current codebase: `redartulousV3.1.1.zip`

## Outputs
- Updated project archive: `redartulousV3.2.zip` (produced after completing all phases)

## Required commands (must pass with no errors)
- `npm ci`
- `npm run check`
- `npm run test`
- `npm run build`

## Manual run / install checks
- `npx devvit playtest` (or `npm run dev:devvit`)
- Create a post via menu item and verify the post renders inline and plays smoothly.

## Phase map
- Phase 0: Baseline audit + freeze contracts/immutables
- Phase 1: Webview-post posture validation (inline post + preview)
- Phase 2: Carnival background spec + texture generator scaffolding
- Phase 3: Implement Carnival parallax layers in Three scene (horizontal-only)
- Phase 4: UI polish (start poster + HUD tweaks for carnival)
- Phase 5: Determinism + performance + accessibility guardrails
- Phase 6: QA pass (desktop + mobile) + regression tests
- Phase 7: Packaging + release notes
