export type GameId = string;

/**
 * Description of a single throw result from the server.
 */
export type ThrowSegment = {
  /**
   * The wedge number hit. Bulls are represented by 25 or 50. Misses are 0.
   */
  number: number | 25 | 50 | 0;
  /**
   * Multiplier ring: 1 for singles/bull, 2 for doubles, 3 for triples.
   */
  multiplier: 1 | 2 | 3;
  /**
   * Human‑readable label (e.g. "T20", "D5", "SBULL", "DBULL", "MISS").
   */
  label: string;
  /**
   * Points scored for this throw (multiplier × number, or bull values).
   */
  points: number;
};

export type ThrowResult = {
  /**
   * Index of the throw in the game (zero based).
   */
  throwIndex: number;
  /**
   * Aiming information sent by the client (normalized to board radius = 1).
   */
  aim: { x: number; y: number; radius: number };
  /**
   * Server‑computed hit location and polar information (normalized).
   */
  hit: { x: number; y: number; r: number; angleFromTopRad: number };
  /**
   * Segment description of the hit.
   */
  segment: ThrowSegment;
  /**
   * Total score for the user at this throw.
   */
  totalScore: number;
  /**
   * Darts remaining after this throw.
   */
  dartsLeft: number;
  /**
   * Server time in milliseconds when the throw was processed.
   */
  serverTimeMs: number;
};

export type GameState = {
  /** Unique identifier for this game instance. */
  gameId: GameId;
  /** Creation timestamp of the game. */
  createdAtMs: number;
  /** Seed used for deterministic sampling. */
  seed32: number;
  /** Total darts allowed in the round. */
  dartsTotal: number;
  /** Darts remaining in the current round. */
  dartsLeft: number;
  /** Accumulated total score so far. */
  totalScore: number;
  /** Index of next throw. */
  throwIndex: number;
  /** History of previous throws (trimmed to a reasonable length). */
  history: ThrowResult[];
  /** Timestamp of the last processed throw. Used for simple rate limiting. */
  lastThrowAtMs?: number;
};