# API Contract (Reference)

This plan assumes the existing shared types remain the contract of record:
- `src/shared/types/api.ts`
- `src/shared/types/game.ts`

## Endpoints

### POST /api/game/new
**Request:** `NewGameRequest`
- `dartsTotal?: number`

**Response:** `NewGameResponse`
- `{ ok: true, state: GameState }` OR `{ ok:false, error:string }`

### GET /api/game/state
**Response:** `StateResponse`
- `{ ok:true, state: GameState | null }` OR `{ ok:false, error:string }`

### POST /api/game/throw
**Request:** `ThrowRequest`
- `gameId: string`
- `aimX: number`
- `aimY: number`
- `radius: number`
- `clientElapsedMs?: number`

**Response:** `ThrowResponse`
- `{ ok:true, result: ThrowResult }` OR `{ ok:false, error:string }`

### GET /api/leaderboard
**Response:** `LeaderboardResponse`
- `{ ok:true, entries:[{ userName?:string, score:number, rank:number, ... }] }` OR `{ ok:false, error:string }`

## Compatibility rules
- Do not rename routes.
- Do not remove fields.
- Any new fields must be optional.
