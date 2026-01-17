import express from "express";
import type { Response } from "express";
import { Devvit } from "@devvit/public-api";

import {
  createServer,
  getServerPort,
  context,
  redis,
  reddit,
} from "@devvit/web/server";

import type {
  NewGameRequest,
  NewGameResponse,
  ThrowRequest,
  ThrowResponse,
  StateResponse,
  LeaderboardResponse,
} from "../shared/types/api";
import type { GameState, ThrowResult } from "../shared/types/game";

import {
  keyLeaderboard,
  keyUserGame,
  newGameId,
  randomSeed32,
  safeParseGameState,
  trimHistory,
  toUint32,
} from "./gameStore";

import {
  clampAim,
  clampRadius,
  sampleUniformInCircle,
  scoreHit,
  xorshift32,
} from "./dartMath";

/**
 * Build a small UI for the post preview. The preview is a lightweight piece of
 * markup that is rendered while the full webview loads. It shows the
 * Redartulous title, an optional top‑score indicator, and a short call to
 * action. Devvit allows JSX in server code and will automatically render
 * `<vstack>`/`<text>` components. The return type is deliberately `any`
 * because the Devvit compiler handles the JSX and we don't want TypeScript
 * to infer a React type here.
 *
 * @param highScore Optional high score object with a score and member name.
 */
function buildPreview(highScore?: { score: number; member: string | null }): any {
  const hasScore = highScore && Number.isFinite(highScore.score);
  return (
    <vstack height="100%" width="100%" alignment="middle center" gap="small">
      <text size="large">REDARTULOUS</text>
      <text size="medium">Carnival Midway Darts</text>
      {hasScore ? (
        <text size="small">Top Score: {highScore!.score}</text>
      ) : (
        <text size="small">Step up to the big-top board!</text>
      )}
      <text size="xsmall">Tap to play under the lights</text>
    </vstack>
  );
}

/**
 * Retrieve the current top score from the leaderboard for a given post. It
 * returns the highest score along with the member string. If no scores are
 * present the function returns null. The function mirrors the logic used in
 * the /api/leaderboard endpoint, but only fetches the best entry.
 *
 * @param postId The post id for which to fetch the leaderboard.
 */
async function getTopScore(
  postId: string
): Promise<{ score: number; member: string | null } | null> {
  const lbKey = keyLeaderboard(postId);
  let members: string[] = [];
  // Try descending range first if available
  try {
    const maybe = (await (redis as any).zRevRange?.(lbKey, 0, 0)) as unknown;
    if (Array.isArray(maybe) && (maybe.length === 0 || typeof maybe[0] === "string")) {
      members = zRangeToMembers(maybe);
    }
  } catch {
    // ignore
  }
  // Fallback: normal zRange (ascending), then reverse
  if (members.length === 0) {
    try {
      const zr = (await (redis as any).zRange(lbKey, 0, 0)) as unknown;
      members = zRangeToMembers(zr);
      members = members.slice().reverse();
    } catch {
      members = [];
    }
  }
  if (!members || members.length === 0) {
    return null;
  }
  const member = members[0];
  let score = 0;
  try {
    const s = await redis.zScore(lbKey, member);
    score = s ? Number(s) : 0;
  } catch {
    score = 0;
  }
  return { score, member };
}

/**
 * Update the post preview to reflect the current top score. This helper
 * fetches the top score and then calls `setCustomPostPreview` on the post.
 * If anything fails (e.g. Redis or Reddit API), the error is silently
 * ignored to avoid impacting gameplay. The preview includes a title and
 * optional high score message.
 *
 * @param postId The ID of the custom post to update.
 */
async function updatePostPreview(postId: string): Promise<void> {
  try {
    const top = await getTopScore(postId);
    const post = await reddit.getPostById(postId as `t3_${string}`);
    const preview = buildPreview(top ?? undefined);
    await (post as any).setCustomPostPreview(() => preview);
  } catch {
    // Fail silently — preview updates are non‑critical
  }
}

/**
 * Duration (in seconds) a game state will live in Redis before being purged. We
 * store state per user per post to allow players to resume if they refresh.
 */
const GAME_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Cooldown between throws in milliseconds. If a player tries to throw again
 * faster than this interval an error will be returned. Adjust to taste.
 */
const THROW_COOLDOWN_MS = 500;

/**
 * Express app. We use JSON parsing with a small size limit since payloads
 * contain only numbers and small objects.
 */
const app = express();
app.use(express.json({ limit: "1mb" }));

/**
 * Utility to get the postId and userId from the Devvit context. Throws if
 * either is missing. Reddit requires a logged in user for interactive games.
 */
function requireIds(): { postId: string; userId: string; userName?: string } {
  const postId = context.postId ?? "";
  const userId = context.userId ?? "";

  // Depending on SDK/runtime, username may be exposed differently.
  // Keep it optional and defensive.
  const userName =
    (context as any).username ??
    (context as any).userName ??
    (context as any).user?.username ??
    undefined;

  if (!postId) throw new Error("Missing postId in context");
  if (!userId) throw new Error("Missing userId in context (user must be logged in)");
  return { postId, userId, userName };
}

/** Current time in milliseconds. */
function nowMs(): number {
  return Date.now();
}

/** Load a game state from Redis. Returns null if nothing stored. */
async function loadGame(postId: string, userId: string): Promise<GameState | null> {
  const raw = await redis.get(keyUserGame(postId, userId));
  return safeParseGameState(raw);
}

/** Save a game state to Redis and set its TTL. */
async function saveGame(postId: string, userId: string, state: GameState): Promise<void> {
  const key = keyUserGame(postId, userId);
  await redis.set(key, JSON.stringify(state));

  // Apply an expiry if supported. If expire throws, ignore gracefully.
  try {
    await redis.expire(key, GAME_TTL_SECONDS);
  } catch {
    // Some Redis clients / environments may not support expire.
  }
}

/** Clear a stored game state completely. */
async function clearGame(postId: string, userId: string): Promise<void> {
  await redis.del(keyUserGame(postId, userId));
}

/**
 * Update the leaderboard for a post with the given score. Only keeps the
 * player's best score.
 */
function leaderboardMemberFor(userId: string, userName?: string): string {
  // Option A: store the visible username directly in the sorted set.
  // If username isn't available in this runtime, fall back to userId.
  const name = (userName ?? "").trim();
  return name ? name : userId;
}

async function bumpLeaderboard(
  postId: string,
  userId: string,
  userName: string | undefined,
  score: number
): Promise<void> {
  const lbKey = keyLeaderboard(postId);
  const member = leaderboardMemberFor(userId, userName);

  try {
    const existing = await redis.zScore(lbKey, member);
    const existingNum = existing ? Number(existing) : null;

    if (existingNum === null || score > existingNum) {
      // Devvit Redis expects a single ZMember object, not an array.
      await redis.zAdd(lbKey, { score, member });

      // When the leaderboard changes (either a new entry or a higher score),
      // update the post preview to reflect the latest top score. This call
      // reads the current top score and calls setCustomPostPreview on the post.
      await updatePostPreview(postId);
    }
  } catch {
    // If sorted-set ops aren't supported in this environment, ignore.
  }
}

// -- Endpoints ------------------------------------------------------------------

app.get("/api/ping", async (_req, res) => {
  res.json({ ok: true, message: "pong", time: nowMs() });
});

/**
 * Start a new game. Overwrites any existing game state for this user/post.
 */
app.post("/api/game/new", async (req, res: Response<NewGameResponse>) => {
  try {
    const { postId, userId } = requireIds();
    const body = (req.body ?? {}) as NewGameRequest;

    const dartsTotalRaw = body.dartsTotal ?? 10;
    const dartsTotal = Number.isFinite(dartsTotalRaw)
      ? Math.max(1, Math.min(30, Math.floor(dartsTotalRaw)))
      : 10;

    const state: GameState = {
      gameId: newGameId(),
      createdAtMs: nowMs(),
      seed32: randomSeed32(),
      dartsTotal,
      dartsLeft: dartsTotal,
      totalScore: 0,
      throwIndex: 0,
      history: [],
    };

    await saveGame(postId, userId, state);

    const out: NewGameResponse = { ok: true, state };
    res.json(out);
  } catch (e) {
    const out: NewGameResponse = {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
    res.status(400).json(out);
  }
});

/**
 * Get the current game state. Returns null if no game in progress.
 */
app.get("/api/game/state", async (_req, res: Response<StateResponse>) => {
  try {
    const { postId, userId } = requireIds();
    const state = await loadGame(postId, userId);

    const out: StateResponse = { ok: true, state };
    res.json(out);
  } catch (e) {
    const out: StateResponse = {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
    res.status(400).json(out);
  }
});

/**
 * Submit a throw. The server combines the player's aim with a deterministic
 * random offset to compute the actual hit. Rate limiting and input clamping
 * protect against abuse.
 */
app.post("/api/game/throw", async (req, res: Response<ThrowResponse>) => {
  try {
    const { postId, userId, userName } = requireIds();
    const body = (req.body ?? {}) as ThrowRequest;

    if (!body || typeof body !== "object") throw new Error("Missing request body");
    if (typeof body.gameId !== "string" || !body.gameId) throw new Error("Missing gameId");

    const state = await loadGame(postId, userId);
    if (!state) throw new Error("No active game. Start a new game first.");
    if (state.gameId !== body.gameId) throw new Error("GameId mismatch. Refresh state.");
    if (state.dartsLeft <= 0) throw new Error("No darts left. Start a new game.");

    // Rate limit: ensure at least THROW_COOLDOWN_MS ms between throws
    const now = nowMs();
    if (state.lastThrowAtMs && now - state.lastThrowAtMs < THROW_COOLDOWN_MS) {
      throw new Error("You're throwing too fast. Please wait a moment.");
    }

    // Clamp inputs
    const aimX = clampAim(Number(body.aimX));
    const aimY = clampAim(Number(body.aimY));
    const radius = clampRadius(Number(body.radius));

    // Derive deterministic seed for this throw (mix in throwIndex and client elapsed)
    const clientElapsed = Number.isFinite(body.clientElapsedMs ?? NaN)
      ? Math.floor(Number(body.clientElapsedMs))
      : 0;

    const mix =
      toUint32(state.seed32) ^
      toUint32((state.throwIndex + 1) * 0x85ebca6b) ^
      toUint32(clientElapsed * 0xc2b2ae35);

    const nextU32 = xorshift32(mix);

    // Sample offset inside the aim circle using the *clamped* radius
    const { dx, dy } = sampleUniformInCircle(nextU32, radius);
    const hitX = aimX + dx;
    const hitY = aimY + dy;

    const scored = scoreHit(hitX, hitY);

    const throwResult: ThrowResult = {
      throwIndex: state.throwIndex,
      // IMPORTANT: return the clamped aim+radius so the client can lock visuals to server truth
      aim: { x: aimX, y: aimY, radius },
      hit: { x: hitX, y: hitY, r: scored.r, angleFromTopRad: scored.angleFromTopRad },
      segment: scored.segment,
      totalScore: state.totalScore + scored.segment.points,
      dartsLeft: state.dartsLeft - 1,
      serverTimeMs: now,
    };

    // Update state
    state.totalScore = throwResult.totalScore;
    state.dartsLeft = throwResult.dartsLeft;
    state.throwIndex = state.throwIndex + 1;
    state.history = trimHistory([...(state.history ?? []), throwResult], 50);
    state.lastThrowAtMs = now;

    await saveGame(postId, userId, state);

    // Update leaderboard with best score achieved so far
    await bumpLeaderboard(postId, userId, userName, state.totalScore);

    const out: ThrowResponse = { ok: true, result: throwResult };
    res.json(out);

    // Auto clear game when finished to free memory
    if (state.dartsLeft <= 0) {
      try {
        await clearGame(postId, userId);
      } catch {
        // ignore
      }
    }
  } catch (e) {
    const out: ThrowResponse = {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
    res.status(400).json(out);
  }
});

/**
 * Normalize whatever zRange returns into a list of member strings.
 *
 * In some Devvit SDK versions / environments, zRange may return:
 *  - string[] (members)
 *  - { member: string; score: number }[] (members+scores objects)
 *
 * This helper handles both so TypeScript stays happy and runtime stays safe.
 */
function zRangeToMembers(zr: unknown): string[] {
  if (!Array.isArray(zr)) return [];
  if (zr.length === 0) return [];

  // Case 1: string[]
  if (typeof zr[0] === "string") {
    return (zr as unknown[]).filter((x) => typeof x === "string") as string[];
  }

  // Case 2: {member,score}[]
  const out: string[] = [];
  for (const item of zr as any[]) {
    if (item && typeof item === "object" && typeof item.member === "string") {
      out.push(item.member);
    }
  }
  return out;
}

/**
 * Retrieve the top players for the current post. Returns an array of the top
 * 10 scores.
 *
 * Important: Devvit Redis method availability varies by SDK version.
 * We try, in order:
 *  - (redis as any).zRevRange(lbKey, 0, 9) -> string[]
 *  - redis.zRange(lbKey, 0, 9) -> string[] OR {member,score}[]
 * Then we reverse for "top first" and fetch zScore for each member.
 */
app.get("/api/leaderboard", async (_req, res: Response<LeaderboardResponse>) => {
  try {
    const postId = context.postId ?? "";
    if (!postId) throw new Error("Missing postId in context");

    const lbKey = keyLeaderboard(postId);
    let members: string[] = [];

    // Try descending range first if the method exists in this environment.
    try {
      const maybe = (await (redis as any).zRevRange?.(lbKey, 0, 9)) as unknown;
      if (Array.isArray(maybe) && (maybe.length === 0 || typeof maybe[0] === "string")) {
        members = zRangeToMembers(maybe);
      }
    } catch {
      // ignore
    }

    // Fallback: normal zRange (often ascending), then reverse.
    if (members.length === 0) {
      try {
        const zr = (await (redis as any).zRange(lbKey, 0, 9)) as unknown;
        members = zRangeToMembers(zr);
        members = members.slice().reverse();
      } catch {
        members = [];
      }
    }

    const entries: { userId: string; userName?: string; score: number; rank: number }[] = [];

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      let score = 0;
      try {
        const s = await redis.zScore(lbKey, member);
        score = s ? Number(s) : 0;
      } catch {
        score = 0;
      }

      // Option A: member is the visible username (or userId fallback)
      entries.push({ userId: "", userName: member, score, rank: i + 1 });
    }

    const out: LeaderboardResponse = { ok: true, entries } as any;
    res.json(out);
  } catch (e) {
    const out: LeaderboardResponse = {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    } as any;
    res.status(400).json(out);
  }
});

/**
 * Menu item endpoint: creates a new "custom post" using the Devvit Web post
 * entrypoint ("default") so players can start the game without hunting for the
 * composer type.
 */
app.post("/internal/menu/new-post", async (_req, res: Response) => {
  try {
    const subredditName =
      (context as any).subredditName ??
      (context as any).subreddit?.name ??
      "";

    if (!subredditName) throw new Error("Missing subredditName in context");

    // Build a simple preview for the post. We don't include a high score here
    // because the post has just been created and no one has played yet. The
    // buildPreview helper returns a JSX element accepted by the Devvit API.
    const preview = buildPreview();

    // Create the custom post with the preview attached. The call returns a
    // Post object which could be used to further customize the preview, but
    // passing the preview here is sufficient.
    await reddit.submitCustomPost({
      subredditName,
      title: "Redartulous — Darts",
      preview,
    } as any);

    // IMPORTANT: Devvit validates UiResponse keys strictly.
    // Do NOT include custom keys like "postId".
    res.status(200).json({
      showToast: {
        text: `Game post created. Open the newest post in r/${subredditName} to play!`,
        appearance: "success",
      },
    });
  } catch (e) {
    res.status(200).json({
      showToast: {
        text: e instanceof Error ? e.message : "Failed to create post",
        appearance: "neutral",
      },
    });
  }
});

// Create Devvit server and start listening.
// Devvit will manage binding to the appropriate port when running inside Reddit.
const server = createServer(app);

server.on("error", (err: unknown) => {
  console.error(`server error; ${err instanceof Error ? err.stack : String(err)}`);
});

server.listen(getServerPort());
