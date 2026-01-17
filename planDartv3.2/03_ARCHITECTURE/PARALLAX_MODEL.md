# Parallax Model (Horizontal-only)

## Rule
All parallax is computed from **one scalar X offset**.

## Recommended model
Use a hybrid of:
- time drift along X (slow)
- aim offset along X (very small)

Example:
- `baseX = (t * speed) % 1`
- `aimX  = clamp(aim.x * 0.03, -0.03, 0.03)`
- `tex.offset.x = baseX + aimX`
- `tex.offset.y = 0` (constant)

## Speeds (back → front)
- Layer 1: 0.006 to 0.012
- Layer 2: 0.012 to 0.022

## Forbidden
- Any `offset.y` motion
- Any diagonal vector offset
