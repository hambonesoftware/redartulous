# Master Agent Prompt — Redartulous v3.2

You are executing `planDartv3.2` against `redartulousV3.1.1` to produce `redartulousV3.2`.

## Absolute requirements
- Obey `planDartv3.2/02_IMMUTABLES/IMMUTABLES.md`.
- Do not change scoring math, wedge mapping, or server throw validation.
- Do not break shared API types; only optional additions allowed.
- Carnival Option A background must be active during gameplay.
- Parallax must be horizontal-only (no `offset.y` writes).

## Execution order
Run these phase agents in order:
- `02_PHASE_AGENTS/PHASE_0_AGENT.md`
- `02_PHASE_AGENTS/PHASE_1_AGENT.md`
- `02_PHASE_AGENTS/PHASE_2_AGENT.md`
- `02_PHASE_AGENTS/PHASE_3_AGENT.md`
- `02_PHASE_AGENTS/PHASE_4_AGENT.md`
- `02_PHASE_AGENTS/PHASE_5_AGENT.md`
- `02_PHASE_AGENTS/PHASE_6_AGENT.md`
- `02_PHASE_AGENTS/PHASE_7_AGENT.md`

## After each phase
- Run required tests.
- Record a completion note (use `04_TEMPLATES/PHASE_COMPLETION_NOTE_TEMPLATE.md`).

