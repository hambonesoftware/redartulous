# CHANGELOG.md — Devvit Flat Darts 2.0

This changelog summarizes the significant file‑level changes made to convert the original Three.js darts prototype into a fully runnable Devvit Web app with an authoritative server and deterministic scoring.  It covers work completed in Phases 1–5.

## v3.2 (Carnival Midway Background)

This release refreshes the visual identity with a Carnival Midway backdrop while keeping gameplay logic intact.

### Changed

- **Carnival Midway background (Option A)** – Replaced the neon arcade background with procedural carnival textures and layered parallax planes.
- **Horizontal-only parallax** – Background drift is constrained to the X axis only, with no vertical motion.

## Added

- **`devvit.json` → `menu.items`** – Added a subreddit menu item (`Start Darts Game`) that invokes `/internal/menu/new-post` so moderators can create a darts game post via the Reddit UI【465134339298065†L29-L37】.  Added `server.dir` property to ensure Devvit can locate the bundled server at runtime.
- **`src/server/index.ts`** – Replaced the Express server with a minimal HTTP router using Node’s `http` API and Devvit’s `createServer`.  Implemented REST endpoints for game lifecycle (`/api/ping`, `/api/game/new`, `/api/game/state`, `/api/game/throw`, `/api/leaderboard`) and an internal menu endpoint (`/internal/menu/new-post`) that calls `reddit.submitCustomPost` to create posts.  Added JSON body parsing with size limits, deterministic sampling based on seed, throw index and elapsed time, rate limiting, TTL storage of per‑user game state in Redis, and leaderboard updates.
- **`tools/score_harness.ts`** – Expanded the test harness to include 14 canonical scoring cases, adding boundary tests around the triple ring and additional wedges (triple 5, single 14).  The harness exits with an error code on failure to integrate with `npm test`.
- **`CHANGELOG.md`** (this file) – Summarizes all changes.

## Changed

- **`package.json`** – Removed Express and its type declarations from dependencies, added `tsx` for running TypeScript tests, and simplified scripts (`npm run dev` builds client/server and runs playtest).  Added a `test` script that runs the scoring harness.  The `@devvit/web` and `three` dependencies remain.
- **`devvit.json`** – Updated the `name` to a valid slug and added a `server.dir` entry.  Added the `menu` object with the subreddit menu item.  Set `dev.subreddit` to a placeholder value that users should customize.
- **`RUN.md`** – Expanded with instructions for using the new subreddit menu item to create posts.  Clarified that the server will redirect to the new post and that each post has its own leaderboard and game state.  Retained guidance on Node installation, Devvit login, and playtesting.
- **`TESTING.md`** – Updated automated test expectations to reflect the 14 canonical scoring cases, listing additional examples and clarifying harness behaviour.  Added a note in the manual checklist reminding testers that the `Start Darts Game` menu item remains available after reloading the post.

## Removed

- **Express server** – The previous Express‑based implementation and its associated middleware were removed in favour of a lightweight HTTP server.  All references to `express`, `body-parser` and similar packages were deleted from the codebase and `package.json`.

## Known limitations and future improvements

- The project’s Three.js rendering remains largely unchanged from the prototype.  While the board is flat and performance is acceptable on modern devices, further optimization (e.g. offloading static textures or using instanced geometry) could improve FPS on low‑end phones.
- Leaderboard and game state are stored in Redis with a seven‑day TTL.  Long‑term retention or cross‑subreddit leaderboards would require additional persistence strategies.
- Automated tests focus exclusively on scoring.  Additional integration tests covering rate limiting, Redis persistence and menu post creation would improve confidence.

## v3.0.3 (Neon HUD & Parallax Background)

This release introduces the first neon visual upgrades. It is fully backwards‑compatible with the scoring logic and API, and focuses entirely on client‑side rendering and UX polish.

### Added

- **`src/client/game/neonTextures.ts`** – New module that procedurally generates neon arcade backgrounds on a canvas. Two variants are produced, providing cyan/magenta palettes, scanlines, grids and glyphs. Textures repeat and are animated for subtle parallax.

### Changed

- **`src/client/game/DartGame.ts`** – Replaced the striped background with two large parallax planes using the new neon textures. Added support for a pip row to indicate darts remaining and slow drift speeds based on the neon specification. Added new HUD state fields (`lastDartsLeft`, `lastLastLabel`) and methods to animate pip pulses and last‑hit slide‑ins. Background layers now live at z = −6 and z = −7 with `MeshBasicMaterial` to preserve emissive appearance.

- **`src/client/main.ts`** – Updated the DOM builder to include a `dartsPips` container in the HUD and passed it to `DartGame`.

- **`src/client/style.css`** – Introduced CSS variables for the neon palette and redesigned the HUD card with a glassy gradient, subtle neon border glow and larger type. Added styling for the darts pips, plus new `pulse` and `slide‑in` animations.

### Notes

- These changes are purely visual and do not affect game mechanics or server APIs. Existing save data remains compatible. All textures and assets continue to be generated procedurally; no external images are required.

## v3.0.4 (Double Bull Sparkles)

This release adds a celebratory particle effect when the player hits a **double bull (DBULL)**.  The effect does not modify game logic or scoring—it is purely a visual flourish designed to reward bullseye accuracy.

### Added

- **Sparkle systems in `DartGame.ts`** – A lightweight particle system was implemented using `THREE.Points`.  When a throw lands on a double bull, a burst of ~120 sparkles appears at the hit location.  Each particle has a random velocity and shared lifespan (0.7–1.0 s).  Particles drift outward and upward from the center before fading away with additive blending.  The system updates itself each frame and self‑removes when expired.

### Changed

- **`src/client/game/DartGame.ts`** – Added fields to track active sparkle systems and the last frame time.  Introduced `spawnSparkles()` and `updateSparkles()` methods to create and update particle bursts.  The main render loop now updates sparkles each frame.  The `throwAt()` method now triggers a sparkle burst when the segment label is `DBULL`.

### Notes

- This feature is strictly a client-side visual effect.  No changes were made to the server, scoring logic or API surfaces.  The particle system uses no external libraries or assets and maintains performance by limiting the number of particles.

## v3.0.5 (Board Polish)

This update refines the dartboard visuals to improve readability and polish without altering scoring or wedge order.

### Added

- **High-contrast rim numbers** – The outer rim numerals (1–20) now render with a semi‑transparent black stroke beneath a bright white fill. This outline increases legibility against alternating dark/light wedges while preserving the classic look.

### Changed

- **`src/client/game/boardTexture.ts`** – Updated the canvas drawing code for the board texture. Rim numbers are drawn with both stroke and fill; bullseye values (“25”, “50”) now include a dark outline. The `D` and `T` ring markers use a slightly higher opacity to stand out. These tweaks are purely aesthetic.

### Notes

- Only visual layer changes were made; scoring logic, hit detection and server APIs remain unchanged. The canvas rendering approach still produces the board procedurally, with no external image dependencies.

## v3.0.6 (Validation & Packaging)

This maintenance release finalises the v3.0 series by validating the build and packaging the full project. No functional changes were introduced compared to v3.0.5.

### Added

- *No new features*.  This version exists solely to consolidate and verify previous work.

### Changed

- **Project verification** – Confirmed that the API surface and scoring logic remain unchanged from v3.0.5.  Performed a TypeScript build to ensure the client and server compile.  Ran the score harness to verify scoring remains correct.
- **Packaging** – Prepared the full project archive for release as `redartulousv3.0.6.zip`.

### Notes

- All game mechanics and visual features remain identical to v3.0.5.  This release simply wraps up the development cycle with validation and a final package.

## v3.0.7 (Dynamic Post Preview)

This release introduces a dynamic post preview for Redartulous game posts on Reddit.  The preview appears in the post card while the interactive game loads and updates automatically whenever a new high score is recorded.  It leverages Devvit’s custom post preview APIs to show the game title, a prompt or high score, and a call to action.

### Added

- **`src/server/index.ts`** – Added helper functions `buildPreview()`, `getTopScore()`, and `updatePostPreview()` to construct a lightweight preview UI, fetch the top score from Redis and update the post preview.  Each preview uses Devvit UI components (`<vstack>` and `<text>`) to display the title, optional top‑score line and a “Tap to play” prompt.
- **Leaderboard integration** – Modified `bumpLeaderboard()` so that whenever a player posts a new high score, the server automatically calls `updatePostPreview()` to refresh the post’s preview.  This ensures the preview reflects the current top score without waiting for manual intervention.
- **Preview on post creation** – Updated the `/internal/menu/new-post` endpoint to pass a preview component via the `preview` property when calling `reddit.submitCustomPost()`.  The initial preview omits the high score line since no one has played yet.

### Notes

- The dynamic preview is purely a UI enhancement; it does not alter any game mechanics, scoring logic or API surfaces.  If Redis or the Reddit API are unavailable, preview updates fail silently to avoid interrupting gameplay.
- Preview markup is rendered on the server using Devvit’s JSX support.  The server remains type‑safe by returning `any` for the preview so that the Devvit compiler handles the JSX types.

## v3.0.8 (Aim Highlight & Visual Polish)

This release builds on v3.0.7 by adding a real‑time **aim highlight** overlay and other minor visual touches.  It enhances readability by showing which wedge of the dartboard the player is currently targeting, without altering scoring or mechanics.

### Added

- **Wedge highlight overlay** – Introduced a semi‑transparent wedge overlay mesh in `src/client/game/DartGame.ts`.  The overlay covers one twentieth of the board and sits slightly above the board plane.  In each animation frame, its rotation is updated to align with the wedge currently under the player’s aim.  The overlay uses a neon cyan hue with low opacity to complement the existing neon palette and fades out when the aim moves outside the board.

### Changed

- **`src/client/game/DartGame.ts`** – Added a `wedgeHighlight` field and created the overlay geometry during construction.  Updated the main render loop to compute the polar angle of the aim, map it to a wedge index and rotate the highlight accordingly.  The overlay’s opacity is lowered when the aim radius exceeds the board radius.

### Notes

- This improvement is purely visual; the server code and scoring logic remain unchanged.  Players can now better anticipate which wedge they’re aiming at, especially on smaller screens.  Future polish could include ring‑specific highlights or animated transitions, but those are beyond the scope of this version.

## v3.1.1 (HUD Layout: Fixed Top Bar)

This release addresses the primary UX regression where the HUD could overlap the dartboard on smaller embed sizes. The HUD is now a **fixed top bar** that takes its own layout row, and the Three.js canvas renders in a dedicated stage below it.

### Changed

- **`src/client/main.ts`** – Added a `#stage` container and moved all in‑game overlays (toast, leaderboard, summary) into it. The `DartGame` renderer now mounts into `#stage` instead of `#app`, so the HUD never sits on top of the playfield.
- **`src/client/style.css`** – Converted `#app` to a two‑row CSS grid (`auto 1fr`). Updated `#hud` styling from absolute overlay to a responsive top bar (flex, wrap, safe‑area padding). Added `#stage` styling to fill the remaining space.

### Notes

- Gameplay, scoring, and server logic are unchanged. This update is strictly layout/UI.
