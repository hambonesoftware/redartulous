# Immutables (Do Not Change)

## Gameplay + scoring
- `src/server/dartMath.ts` scoring math MUST NOT change.
- Wedge order and segment mapping MUST NOT change.
- Aim clamping behavior MUST NOT change.

## API routes + shared types
- Keep existing routes in `src/server/index.ts`.
- Keep shapes in `src/shared/types/*`.

## Determinism
- Throw determinism mixing rules remain server-owned.

## Webview post posture
- `devvit.json` continues to serve web client from `public/`.

## Parallax Y lock
- Background must not animate in Y.
- The only allowed movement axis is X.
