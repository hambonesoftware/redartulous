# Carnival Background Spec — Option A (Night Midway)

## Intent
Replace the Neon Arcade background with a carnival scene that reads immediately as:
- fairground-at-night
- warm string lights
- tent stripe motifs
- silhouettes of rides

## Composition rules
- Keep the dartboard area calm:
  - less detail in center
  - use a gentle center glow behind board

## Layers (back → front)
1) Sky gradient + faint haze
2) Ride silhouettes (Ferris/coaster/tents) low contrast
3) Bokeh string lights band (warm, blurred)
4) Tent stripe arcs (muted red/cream)
5) Foreground vignette + optional fence silhouettes

## Palette suggestion
- Sky: deep navy/purple
- Bulbs: warm amber (subtle)
- Stripes: desaturated red/cream
- Silhouettes: near-black with 20–40% opacity

## Implementation target
- Add new generator file:
  - `src/client/game/carnivalTextures.ts`
    - `makeCarnivalLayerTexture(layer: 1|2, seed: number): THREE.CanvasTexture`
- DartGame uses two background layers, each with different drift speeds.
