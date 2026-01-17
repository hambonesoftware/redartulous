# Manual Test Script (required)

## Setup
- `npm run build`
- `npx devvit playtest` (or `npm run dev:devvit`)

## In Reddit (playtest environment)
1) Open the target subreddit.
2) Use menu item: **Create a Redartulous post**.
3) Open the newest post.

## Gameplay checks
- [ ] Start panel shows carnival style poster + start button.
- [ ] Clicking Start hides the panel and starts the game.
- [ ] Hold-to-aim works (desktop mouse).
- [ ] Release-to-throw works.
- [ ] Score updates.
- [ ] Darts decrement.
- [ ] Leaderboard opens.

## Background checks
- [ ] Carnival background is visible during gameplay.
- [ ] Parallax moves left/right only.
- [ ] No vertical drift observed over 30 seconds.
- [ ] Center behind board stays readable.

## Mobile checks (at least one)
- [ ] Touch drag + release works.
- [ ] No accidental scroll lock issues.
