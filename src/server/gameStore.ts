import type { GameId, GameState, ThrowResult } from "../shared/types/game";

// Keys used in Redis are namespaced by the post id. Games are stored per user
// within a post so different users do not collide with each other.

/** Generate the Redis key for a user's game state for a given post. */
export function keyUserGame(postId: string, userId: string): string {
  return `darts:usergame:${postId}:${userId}`;
}

/** Generate the Redis key for the leaderboard for a given post. */
export function keyLeaderboard(postId: string): string {
  return `darts:lb:${postId}`;
}

/** Safely parse a stored GameState JSON string. Returns null on failure. */
export function safeParseGameState(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as GameState;
    if (!obj || typeof obj !== "object") return null;
    if (typeof obj.gameId !== "string") return null;
    return obj;
  } catch {
    return null;
  }
}

/** Trim a history array down to a maximum length. Newer throws are kept. */
export function trimHistory(history: ThrowResult[], max: number): ThrowResult[] {
  if (history.length <= max) return history;
  return history.slice(history.length - max);
}

/** Generate a new unique-ish game id. */
export function newGameId(): GameId {
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 1e9).toString(36);
  return `g_${t}_${r}`;
}

/** Force a number into an unsigned 32 bit range. */
export function toUint32(n: number): number {
  return (n >>> 0) >>> 0;
}

/** Generate a random 32 bit seed based on time and Math.random. */
export function randomSeed32(): number {
  const t = Date.now() >>> 0;
  const r = (Math.random() * 0xffffffff) >>> 0;
  return toUint32((t ^ r) + 0x9e3779b9);
}