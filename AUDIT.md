# Phase 0 Audit – Baseline Inspection

This audit captures the state of the supplied project **before** any feature
changes are made.  Its purpose is to understand the structure, identify
configuration issues and document the current build scripts.  Later phases will
refactor the server, improve scoring and add UI polish.

## Repository structure

The project is unpacked under `project/` with the following notable files and
directories:

* `devvit.json` – Devvit metadata describing the app name, permissions and
  entrypoints for the web client and server.
* `package.json` – NPM metadata with dependencies and build scripts.
* `src/client` – Three.js client code.  Entry point is `src/client/main.ts`
  and an accompanying `index.html`.
* `src/server` – TypeScript server code.  The main file is `src/server/index.ts`
  which currently uses **Express**.
* `src/shared` – Shared TypeScript types for API payloads and game state.
* `tools/score_harness.ts` – A small script to validate dart scoring.
* `public/` – Vite build output (client assets); currently empty until built.

Documentation files (`RUN.md`, `TESTING.md`, the previous `AUDIT.md`) exist but
will be replaced in subsequent phases to reflect our changes.

## Devvit configuration (`devvit.json`)

The `devvit.json` currently contains:

```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "dartsflat",
  "permissions": { "redis": true },
  "post": {
    "dir": "public",
    "entrypoints": { "default": { "entry": "index.html" } }
  },
  "server": { "entry": "dist/server/index.js" },
  "dev": { "subreddit": "dartsflat_dev" }
}
```

**Observations**

* The `name` field (`dartsflat`) matches the required pattern `^[a-z][a-z0-9-]*$`.
* The client entry points point at `public/index.html`, which is correct once
  Vite outputs the client bundle.
* Only a `server.entry` is defined.  Recent Devvit versions also accept a
  `server.dir` property; adding it (`dist/server`) can help Devvit locate
  ancillary files when bundling.
* There is **no menu item** defined under `menu.items`.  A subreddit menu item
  will be needed later to allow users to create a darts game post via the
  subreddit’s overflow menu.

## NPM scripts (`package.json`)

Key scripts defined in `package.json` are:

| script             | description                                                     |
|--------------------|-----------------------------------------------------------------|
| `build:client`     | Runs `vite build` to compile the client to `public/`.          |
| `build:server`     | Uses `tsup` to bundle `src/server/index.ts` into `dist/server`. |
| `build`            | Runs client and server builds sequentially.                    |
| `dev:client`       | Runs `vite build --watch` for live client rebuilds.            |
| `dev:devvit`       | Starts a Devvit playtest (`devvit playtest`).                 |
| `dev`              | Builds once, then runs the client watch and playtest in parallel. |
| `deploy`/`publish` | Build and upload/publish the app.                            |
| `logs`             | Stream Devvit logs.                                            |
| `test`             | Runs the scoring harness (`tools/score_harness.ts`) using `tsx`. |

The project declares dependencies on `@devvit/web`, `express` and `three`.
Dev dependencies include `vite`, `tsup`, `typescript`, `tsx` and `concurrently`.

## Build feasibility

The build commands rely on packages from the public npm registry.  When
attempting to run `npm install` in this environment the registry requests are
blocked (HTTP 403 errors), so dependencies cannot be installed.  As a result
`npm run build` fails because tools like `vite` and `tsup` are not available.
These failures are environmental rather than code issues; in a normal
development environment with internet access, `npm install` should succeed.

Because dependencies are missing, we cannot run or verify the build locally in
this container.  However, we have inspected the build scripts and source code
to assess what changes are required.

## Identified issues and planned changes

1. **Express usage** – The server currently creates an Express app and passes it
   into `createServer(app)`.  Per the requirements, we must remove Express and
   implement a minimal router using Node’s `http` module.  The new router will
   parse JSON bodies, clamp input sizes and return typed JSON responses.
2. **Menu registration** – `devvit.json` lacks a `menu.items` section.  We will
   add a subreddit menu item that triggers a call to `/internal/menu/new-post`
   so users can create a darts game post via the subreddit’s overflow menu.
3. **Server configuration** – We will set `server.dir` to `dist/server` and update
   the build script to output CommonJS (`index.cjs`) to better align with
   Devvit’s expectations.  The `server.entry` will be adjusted accordingly.
4. **Redis state and TTL** – The server already stores per‑user game state in
   Redis with a TTL of seven days and updates the leaderboard with sorted
   sets.  We will review and retain this logic, enforcing input clamps and
   rate limiting.
5. **Endpoint definitions** – The existing endpoints (`/api/ping`, `/api/game/new`,
   `/api/game/state`, `/api/game/throw`, `/api/leaderboard`) are mostly
   correct but must be re‑implemented without Express.  We will also add an
   internal endpoint (`/internal/menu/new-post`) for the menu action.
6. **Testing harness** – The current harness tests nine scoring cases.  Later
   phases will expand this to at least twelve canonical cases and integrate it
   into the `npm test` script.

## Conclusion

Even though we cannot run the build in this restricted environment, the source
code reveals that the project is structured sensibly and close to ready for
Devvit.  The critical changes involve replacing Express with a minimal HTTP
router, registering a subreddit menu action in `devvit.json`, tightening server
configuration and expanding tests.  These modifications will be addressed in
the subsequent phases of the project.