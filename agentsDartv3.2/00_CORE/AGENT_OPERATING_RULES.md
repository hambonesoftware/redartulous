# Agent Operating Rules (v3.2)

These rules apply to **every phase**.

## 1) Read-first requirements
Before changing code in a phase, the agent must read:
- `planDartv3.2/01_CONTRACTS/CONTRACTS.md`
- `planDartv3.2/01_CONTRACTS/API_CONTRACT.md`
- `planDartv3.2/01_CONTRACTS/RENDER_CONTRACT.md`
- `planDartv3.2/01_CONTRACTS/ASSET_CONTRACT.md`
- `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
- The specific phase file in `planDartv3.2/04_PHASES/` being executed

## 2) No contract breakage
- Do not rename API routes.
- Do not remove fields.
- Any new fields must be optional.
- Do not change wedge scoring math or server hit validation.

## 3) Horizontal-only parallax
- Background motion must be **X-only**.
- Any `texture.offset.y = ...` writes in gameplay background logic are forbidden.
- Any camera movement must be X-only if it affects background motion.

## 4) Determinism rules
- Server outcomes must not depend on client framerate.
- Any randoms in gameplay outcomes must be seeded and/or server-owned.

## 5) Required tests
After completing each phase:
- `npm run check`
- `npm run test`
- `npm run build`

If a phase modifies install/devvit paths, also:
- `npx devvit playtest` (or the repo's dev script)

## 6) What the agent must produce at the end of each phase
- A short phase note with:
  - files changed
  - tests executed + result
  - screenshots or manual verification notes (where applicable)
  - any deviations (should be none)

## 7) No hidden changes
- If a file changes, it must be listed in that phase's completion note.
- If a file was considered but not changed, mention it as "reviewed only".
