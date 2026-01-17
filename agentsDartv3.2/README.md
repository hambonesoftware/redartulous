# agentsDartv3.2

This is the **execution companion** to `planV3.2.zip`.

## Purpose
Provide **agent-ready prompts**, **handoffs**, **required command checks**, and **file-level success checklists** for each phase in `planDartv3.2/04_PHASES`.

## Inputs
- `redartulousV3.1.1.zip` (current project)
- `planV3.2.zip` (the plan; contains contracts, immutables, and phase definitions)

## Output
- `redartulousV3.2.zip` (updated project)

## Non-negotiables
- Obey `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`.
- Do not change shared API shapes (`src/shared/types/*`) except to add **optional** fields.
- No scoring math changes.
- Gameplay background becomes **Carnival Option A**.
- Parallax must be **X-only** (no diagonal drift).

## Required commands (must pass)
- `npm ci`
- `npm run check`
- `npm run test`
- `npm run build`

## How to use
Execute phases in order:
1) Read `planDartv3.2/01_CONTRACTS/*` and `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`
2) Run Phase 0 agent prompt
3) Continue through Phase 7

Each phase agent file below includes:
- What to read first (plan docs)
- Exact file targets
- Required tests
- Success checklist

## Phase agent files
See: `02_PHASE_AGENTS/PHASE_*_AGENT.md`
