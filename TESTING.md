# TESTING.md — Flat Darts

## 1) Automated scoring harness

Run:

```bash
npm test
```

This executes `tools/score_harness.ts` using tsx and prints PASS/FAIL lines for a set of **14 canonical scoring cases**.  
The harness exercises bulls, misses, singles, doubles and triples across multiple wedges and ring boundaries.

### Examples of canonical cases (all should PASS)

- **Double bull** (r ≤ 0.06): points = 50
- **Single bull** (0.06 < r ≤ 0.13): points = 25
- **Miss outside** (r > 1.0): points = 0
- **Top wedge single** (near +Y): label=20, points=20
- **Right-of-top wedge** (clockwise neighbor): label=1, points=1
- **Triple 20**: points = 60
- **Triple 1**: points = 3
- **Double 20**: points = 40
- **Double 5**: points = 10
- **Just outside DBULL** (around r ≈ 0.061): label=SBULL, points = 25
- **Just inside triple ring** (r ≈ 0.525): scored as a single (20)
- **Just outside triple ring** (r ≈ 0.605): scored as a single (20)
- **Triple 5**: points = 45
- **Single 14**: points = 14

If any of these cases fail, your wedge ordering, ring radii or scoring calculations are incorrect.  
Refer to the harness implementation in `tools/score_harness.ts` for exact input values.

---

## 2) Manual checklist (mobile + desktop)

### A) Boot + rendering
- Open the playtest post
- Board is **flat/orthographic**, centred, no perspective skew
- UI overlays render (score, darts remaining, button(s))
- FPS feels stable; no console spam

### B) New game
- Score starts at 0
- Throws remaining starts at 10
- Probability circle visible and animating subtly (pulse/drift)

### C) Throw + server authority
- Tap/click board -> a throw occurs
- Server response updates:
  - throw index increments
  - exact scored segment label + points is shown
- Reload the post:
  - score persists (Redis-backed state)
  - the subreddit menu still shows **Start Darts Game** as an option to create another post
- Attempt to “cheat” by changing client payload:
  - server ignores any “hit coordinate” and computes hit using deterministic sampling from (seed, throwIndex, elapsedMs, aimX/Y, radius)

### D) Cooldown / spam prevention
- Click rapidly:
  - server returns a rate-limit error and client shows cooldown UI
- After cooldown, throwing works again

### E) Leaderboard
- Leaderboard panel opens/closes cleanly
- Shows top 10 for the post
- Each entry displays the player's visible username (when available)
- After a round ends, total score is written to leaderboard and appears on refresh

### F) Logged-in gating
- Open the playtest post while logged out (or in an incognito session):
  - starting a game / throwing should fail gracefully with a clear error (gameplay requires a logged-in user)

### G) Username display
- Play with two different logged-in users:
  - leaderboard entries show the visible usernames (not truncated user IDs)
  - scores are shared for anyone viewing the post

---

## 3) Determinism spot-check

1. Start a new game.
2. Make a throw at a specific aim point (e.g. near 20).
3. Copy the throw response (seed + throwIndex + elapsedMs used).
4. Repeat the same throw conditions (same aim, same elapsedMs bucket):
   - The server should return the same hit + score.

Note: elapsedMs is optionally quantized server-side; tiny timing differences can legitimately change the sample.
