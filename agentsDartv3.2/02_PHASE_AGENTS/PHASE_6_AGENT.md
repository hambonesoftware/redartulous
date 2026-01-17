# PHASE 6 AGENT — QA Matrix (Desktop + Mobile)

## Mission
Run full regression on gameplay + carnival visuals and complete the QA matrix.

## Read first (required)
- `planDartv3.2/07_TESTS/AUTOMATED_TESTS.md`
- `planDartv3.2/07_TESTS/MANUAL_TEST_SCRIPT.md`
- `planDartv3.2/04_PHASES/PHASE_6_QA_MATRIX.md`

## Automated tests (must pass)
- `npm run check`
- `npm run test`
- `npm run build`

## Manual QA script
Execute every step in `planDartv3.2/07_TESTS/MANUAL_TEST_SCRIPT.md` and record results.

## Specific v3.2 regression focus
- Confirm carnival background shows during gameplay (not only on start screen).
- Confirm parallax is horizontal-only at all times.
- Confirm throws behave exactly as before.
- Confirm leaderboard still works.

## Deliverable
Create a `QA_RESULTS.md` in your working output with:
- date/time
- device matrix notes (desktop + mobile)
- pass/fail for each manual check
- screenshots if available

## Phase 6 success checklist
- [ ] All automated tests pass.
- [ ] All manual checks pass.
- [ ] No vertical drift.
- [ ] No gameplay regressions.
