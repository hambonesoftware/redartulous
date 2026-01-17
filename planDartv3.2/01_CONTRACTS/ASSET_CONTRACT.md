# Asset / Texture Contract (Carnival Option A)

The carnival background must visually read as:

1) **Night sky gradient** (deep navy → purple)
2) **Silhouettes** of Ferris wheel / coaster / tent peaks (low contrast)
3) **Warm bulb bokeh** string lights (blurred circles)
4) **Muted tent stripe arcs** (low saturation)
5) **Foreground vignette** and/or fence silhouettes to frame scene

## Hard constraints
- Keep the gameplay center behind the dartboard relatively calm:
  - concentrate detail in top 1/3 and edges
  - add subtle center glow so board stays readable

## Technical constraints
- Background textures should be generated at <= 1024x1024 (recommended 512–1024).
- Use `THREE.CanvasTexture` or local bundled images.
- For tiling textures:
  - set `wrapS = RepeatWrapping`
  - set `wrapT = RepeatWrapping`
  - set `repeat` to fit wide posts

## Parallax constraints
- The background system may implement:
  - time-based drift along X
  - aim-based offset along X
- Y motion is forbidden.
