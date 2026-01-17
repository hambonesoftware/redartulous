# Roles and Handoffs (Agents v3.2)

This project is small enough to be done by one agent, but is written as if multiple agents exist.

## Suggested roles

### Agent A — Baseline & Contracts
Owns:
- Phase 0 baseline audit
- Contract/immutable verification
- Reproducible test baseline

Handoff artifacts:
- `BASELINE.md` summary (what exists, what will change)
- List of files likely to change in v3.2

### Agent B — WebView Post Posture
Owns:
- Phase 1 webview-post validation
- Ensure inline-in-feed experience
- Ensure build/playtest flows

Handoff artifacts:
- `WEBVIEWPOST_NOTES.md` (what is inline, where it is defined)
- Confirmed command to run local playtest

### Agent C — Carnival Textures
Owns:
- Phase 2 texture generator scaffolding
- Canvas-to-Three texture creation

Handoff artifacts:
- `carnivalTextures.ts` created
- Documented layer specs + constants

### Agent D — Background Integration
Owns:
- Phase 3 integration in `DartGame.ts`
- X-only parallax enforcement

Handoff artifacts:
- grep proof: no `offset.y` writes
- visual verification notes

### Agent E — UI Polish
Owns:
- Phase 4 HUD/poster polish for Carnival theme

Handoff artifacts:
- before/after screenshot notes

### Agent F — Determinism & Perf
Owns:
- Phase 5 guardrails

Handoff artifacts:
- perf notes (FPS stability)
- determinism notes (seed usage)

### Agent G — QA + Packaging
Owns:
- Phase 6 QA matrix
- Phase 7 release packaging

Handoff artifacts:
- QA checklist filled
- `redartulousV3.2.zip` packaged

## Handoff rule
If a phase introduces a new helper module or contract, it must be referenced in:
- `planDartv3.2/01_CONTRACTS/*` (if contract change)
- or Phase docs (if implementation-only)

