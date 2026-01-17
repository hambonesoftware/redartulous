# Acceptance Criteria (v3.2)

## A. Webview post feel
- Post renders inline with smooth animation (Three scene visible in-feed).
- Start screen appears as a "poster" and transitions cleanly into gameplay.

## B. Carnival background
- Background clearly reads as "Night Midway" carnival.
- Two-layer parallax creates depth without distracting gameplay.

## C. Horizontal-only parallax
- Background moves only left/right.
- No diagonal drift (Y stays fixed).

## D. Regression
- Existing gameplay works:
  - new game
  - throw
  - scoring
  - leaderboard
- Probability ring + pending shot locking still correct.

## E. Tests
All must pass:
- `npm run check`
- `npm run test`
- `npm run build`

## F. Manual
- `devvit playtest` works
- menu item creates playable post
- mobile touch aim/release works
