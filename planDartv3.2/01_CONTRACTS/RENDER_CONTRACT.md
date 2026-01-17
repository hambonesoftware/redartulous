# Render / Input Contract

## Render stack
- Client renders with Three.js inside the Devvit Web post.
- Board remains a flat plane with an orthographic camera.

## Input contract
- Player uses hold-to-aim and release-to-throw.
- The aim/probability circle visuals must match server clamping.

## No diagonal motion rule
- Any background drift must be:
  - `x = f(time, aimX)`
  - `y = 0`

If any update loop contains:
- `texture.offset.y = ...`
- `mesh.position.y += ...`
- `camera.position.y += ...`

…it violates the contract.
