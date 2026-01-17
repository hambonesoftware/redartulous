# QA Results

Date: 2026-01-17

## Automated Tests
- npm run check: PASS
- npm run test: PASS
- npm run build: PASS

## Manual Test Matrix
Environment limitations: Manual QA steps require Reddit Devvit playtest and mobile device testing; not available in this environment.

### Gameplay checks
- [ ] Start panel shows carnival style poster + start button. (Not run: requires Devvit playtest)
- [ ] Clicking Start hides the panel and starts the game. (Not run: requires Devvit playtest)
- [ ] Hold-to-aim works (desktop mouse). (Not run: requires Devvit playtest)
- [ ] Release-to-throw works. (Not run: requires Devvit playtest)
- [ ] Score updates. (Not run: requires Devvit playtest)
- [ ] Darts decrement. (Not run: requires Devvit playtest)
- [ ] Leaderboard opens. (Not run: requires Devvit playtest)

### Background checks
- [ ] Carnival background is visible during gameplay. (Not run: requires Devvit playtest)
- [ ] Parallax moves left/right only. (Not run: requires Devvit playtest)
- [ ] No vertical drift observed over 30 seconds. (Not run: requires Devvit playtest)
- [ ] Center behind board stays readable. (Not run: requires Devvit playtest)

### Mobile checks
- [ ] Touch drag + release works. (Not run: requires mobile playtest)
