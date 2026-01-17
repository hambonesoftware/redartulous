# Contracts (v3.2)

These contracts are **hard requirements**. Agents must treat them as binding.

## C1 — API Surface Contract (server)
- Routes and payload shapes MUST remain backward compatible:
  - `POST /api/game/new` → `NewGameResponse`
  - `GET  /api/game/state` → `StateResponse`
  - `POST /api/game/throw` → `ThrowResponse`
  - `GET  /api/leaderboard` → `LeaderboardResponse`
  - `GET  /api/ping`
- Any new fields must be OPTIONAL and ignored safely by older clients.

## C2 — Determinism Contract (throw)
- The server remains the single source of truth for:
  - clamped aim (`aimX`, `aimY`) and clamped `radius`
  - sampled offset (`dx`, `dy`) inside the aim circle
  - hit location + scoring
- Client visuals MUST lock to server-returned truth during pending shot (`pendingShot`).

## C3 — Webview Post Contract
- The post must render as an **inline Devvit Web experience**:
  - `devvit.json` `post.dir` remains `public`
  - entrypoint remains `public/index.html`
  - no external network fetches for visuals
- Post preview remains lightweight and safe to render in Devvit UI.

## C4 — Carnival Background Contract
- Gameplay background MUST be **Option A (Night Midway)**.
- Background MUST be generated procedurally (CanvasTexture) OR from bundled assets.
  - If assets are used, they must be committed under repo (no runtime fetch).

## C5 — Parallax Motion Contract (X-only)
- Background parallax may move **ONLY along X**.
- Background parallax MUST NOT move along Y.
- This means:
  - `texture.offset.y` must remain constant
  - no camera Y drift
  - no layer mesh Y drift

## C6 — Performance Contract
- Must stay smooth in a Reddit post embed:
  - cap renderer pixel ratio to <= 2 (already)
  - avoid huge texture sizes (<= 1024 for background canvases)
  - no per-frame allocations in hot loops

## C7 — Accessibility / UX Contract
- Must remain playable with:
  - mouse drag + release (desktop)
  - touch drag + release (mobile)
- Ensure the Start panel does not block gameplay once dismissed.
