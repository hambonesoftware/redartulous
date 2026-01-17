import type { GameId, GameState, ThrowResult, ThrowSegment } from "./game";

/**
 * Base shape for API error responses.
 */
export type ApiError = { ok: false; error: string };

// -- New game -------------------------------------------------------------------

/**
 * Request body for starting a new game. The number of darts can be specified
 * but defaults to 10 if omitted.
 */
export type NewGameRequest = {
  dartsTotal?: number;
};

/**
 * Response for new game creation. Includes the initial game state.
 */
export type NewGameResponse =
  | { ok: true; state: GameState }
  | ApiError;

// -- Throw ----------------------------------------------------------------------

/**
 * Request body for a throw. Clients send their aim and radius, plus the
 * current game id. The server will compute the actual hit deterministically.
 */
export type ThrowRequest = {
  gameId: GameId;
  aimX: number;
  aimY: number;
  radius: number;
  /** Optional client‑side elapsed time in milliseconds since game start. */
  clientElapsedMs?: number;
};

/**
 * Response for a throw. On success contains the result of the throw.
 */
export type ThrowResponse =
  | { ok: true; result: ThrowResult }
  | ApiError;

// -- State query ----------------------------------------------------------------

/**
 * Response for retrieving the current game state. If no game exists, state
 * will be null. Errors return ApiError.
 */
export type StateResponse =
  | { ok: true; state: GameState | null }
  | ApiError;

// -- Leaderboard ----------------------------------------------------------------

export type LeaderboardEntry = {
  userId: string;
  userName?: string;
  score: number;
  rank: number;
};

export type LeaderboardResponse =
  | { ok: true; entries: LeaderboardEntry[] }
  | ApiError;