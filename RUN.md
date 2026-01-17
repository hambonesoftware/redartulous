# RUN.md — Devvit Flat Darts (Three.js)

These instructions assume **Windows**, but the commands are the same on macOS/Linux.

## Prereqs (new developer checklist)

1. **Node.js**: install **Node 22.2+** (recommended by Devvit).  
   Verify: `node -v`

2. **Reddit + Devvit access**
   - You must have a Reddit account connected to Devvit (developers.reddit.com).
   - You must be a moderator of a small test subreddit (<200 members) **or** use the auto-created dev subreddit from playtest.

3. **No global Devvit CLI required**
   This repo installs Devvit CLI as a **dev dependency**, so you’ll use it via `npx devvit ...` or `npm run ...`.

---

## 1) First-time setup

From the project root:

```bash
npm install
```

Verify toolchain:

```bash
npx devvit version
npx devvit whoami
```

If `whoami` fails, log in:

```bash
npx devvit login
```

> If your terminal can’t open a browser window, use:
>
> `npx devvit login --copy-paste`

---

## 2) IMPORTANT: Set your app name + dev subreddit

Open `devvit.json` and edit:

- `"name"`: must be **unique**, **3–16 characters**, lowercase, numbers or `-`.  
  Example: `"name": "harleysdarts"`

- `"dev.subreddit"`: set to a subreddit you moderate (recommended), e.g. `"mytestsub"`.  
  (The `r/` prefix is optional.)

Devvit config rules are documented here:  
https://developers.reddit.com/docs/0.12/capabilities/devvit_web_configuration  citeturn10view0

---

## 3) Run locally on Reddit (Playtest)

### One command dev loop

```bash
npm run dev
```

What happens:
- Vite builds the web client into `/public`
- tsup bundles the server into `/dist/server`
- `devvit playtest` uploads + installs the app and creates a playable post

If you want to specify a subreddit explicitly:

```bash
npx devvit playtest r/MySubreddit
```

Devvit playtest docs:  
https://developers.reddit.com/docs/guides/tools/devvit_cli  citeturn17view0

---

## 4) Upload (private) and Publish (public)

### Upload (private, visible only to you)

```bash
npm run deploy
```

### Publish (public release)

```bash
npm run publish
```

---

## 5) Create a post manually (after install)

After you’ve uploaded the app into your subreddit, you can create a game post without using the CLI.  
This project defines a **subreddit menu item** (`Start Darts Game`) in `devvit.json`.  
Navigate to your subreddit on Reddit (desktop or mobile), open the **community menu**, and choose **Start Darts Game**.  
The server will create a new interactive post using `reddit.submitCustomPost` and then automatically navigate your browser to the post【465134339298065†L29-L37】.  
Each post has its own leaderboard and game state stored in Redis.

---

## 6) View logs

```bash
npx devvit logs r/MySubreddit
```

---

## Troubleshooting

### A) `devvit --version` hangs
Use the command Devvit documents:

```bash
npx devvit version
```

`--version` is not the documented flag, while `devvit version` is. citeturn17view0

If it still hangs:
1. Remove any global CLI and use the local one:
   ```bash
   npm uninstall -g devvit
   npx devvit version
   ```
2. Clear stale Node/npm state:
   ```bash
   npm cache verify
   ```
3. Corporate proxy/VPN can block the CLI’s network calls (login/metrics). Try a different network.

### B) `devvit dev` is not a command
Correct — Devvit’s CLI commands include `playtest`, `upload`, `publish`, etc. There is no `dev` subcommand. citeturn17view0

### C) Config schema errors about `name` / “additional properties”
That means your `devvit.json` does not match the current schema. This repo’s `devvit.json` is already aligned to the Devvit Web configuration schema. citeturn10view0
