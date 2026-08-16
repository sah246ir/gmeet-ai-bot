# Simple session-based authentication for gmeet-bot

## Context

gmeet-bot's HTTP API (`GET /health`, `POST /meetings`, `GET /meetings/:id`) currently has no authentication at all — anyone who can reach the server can call any endpoint. This adds a minimal session mechanism: a client calls `POST /session` once, gets back a random token (and its expiry), stores that token client-side (e.g. `localStorage`), and sends it back on every subsequent request via an `Authorization: Bearer <token>` header. A middleware validates that token on protected routes. Sessions expire after 2 days.

This repo has no frontend/homepage today (confirmed — only `gmeet-bot/` and `joinee/` exist), so this is a backend-only change: the `/session` endpoint plus the validating middleware. Nothing here builds a UI.

**Confirmed decisions:**
- Sessions are stored in **Postgres via Prisma** (a new `Session` model), consistent with how `Meeting`/`Job`/`TranscriptSegment` are already persisted.
- The client sends the token back as **`Authorization: Bearer <token>`**.
- The middleware protects **every route except `/health` and `/session`** (both must stay reachable without a token).
- **Backend only** — no demo homepage is being added.

## Design

### 1. Prisma model — `gmeet-bot/prisma/schema.prisma`
Add a `Session` model, using the random token itself as the primary key (it's already unique and unguessable, so a separate `id` field would be redundant):
```prisma
model Session {
  token     String   @id
  createdAt DateTime @default(now())
  expiresAt DateTime
}
```
Run `npx prisma migrate dev --name add_session_model` from `gmeet-bot/` to create and apply the migration, following the same workflow used for the earlier `TranscriptSegment.words` migration.

### 2. Session service — `gmeet-bot/src/services/session/session.ts` (new)
Follows the existing `services/<name>/<name>.ts` pattern used by `deepgram`, `pinecone`, `rag`, `llm`, and `transcribe-manager`. Responsibilities:
- `createSession()`: generates a random token via `crypto.randomBytes(32).toString("hex")`, sets `expiresAt = now + 2 days` (`1000 * 60 * 60 * 24 * 2` ms), persists it with `prisma.session.create`, and returns `{ token, expiresAt }`.
- `validateSession(token)`: looks up the token with `prisma.session.findUnique`; returns `null` if it doesn't exist or `expiresAt` is in the past, otherwise returns the session row.

Export a singleton instance (`export const sessionService = new SessionService()`), matching how `RagService`/`TranscribeManager` are instantiated elsewhere.

### 3. Auth middleware — `gmeet-bot/src/http/middleware/auth.ts` (new)
An Express middleware `requireSession(req, res, next)`:
- Reads `req.headers.authorization`, expects the form `Bearer <token>`; if missing/malformed, responds `401 { error: "unauthorized" }`.
- Calls `sessionService.validateSession(token)`; if it returns `null`, responds `401 { error: "unauthorized" }`.
- Otherwise calls `next()`.

### 4. Wire it into routes — `gmeet-bot/src/http/routes.ts`
- Add `router.post('/session', ...)`: calls `sessionService.createSession()` and returns `{ token, expiresAt }` as JSON. No auth required.
- Apply `requireSession` as route-level middleware (second argument) on the routes that need protection — `POST /meetings` and `GET /meetings/:id` — rather than a global `app.use`, so it's explicit at each route which ones are protected and there's no risk of an ordering mistake accidentally leaving something unprotected or blocking `/health`/`/session`.
- `GET /health` and the new `POST /session` stay exactly as-is (no middleware attached).

### Known limitation (not solved here)
Expired session rows aren't cleaned up — `validateSession` correctly rejects them, but they stay in the `Session` table indefinitely. No cleanup job is being added; flagging only, matching this repo's existing "don't build infrastructure that wasn't asked for" convention.

## Files touched
- `gmeet-bot/prisma/schema.prisma` — add `Session` model
- `gmeet-bot/prisma/migrations/<new>/` — generated migration
- `gmeet-bot/src/services/session/session.ts` — new: token generation + validation
- `gmeet-bot/src/http/middleware/auth.ts` — new: `requireSession` middleware
- `gmeet-bot/src/http/routes.ts` — add `POST /session`; apply `requireSession` to `POST /meetings` and `GET /meetings/:id`

## Verification
1. `cd gmeet-bot && npx prisma migrate dev --name add_session_model` — applies the migration against the live DB.
2. `npx tsc -b` — confirms everything typechecks.
3. Start the server (`npm run dev`) and manually exercise the flow:
   - `curl -X POST localhost:3000/session` → `200` with `{ token, expiresAt }`.
   - `curl localhost:3000/meetings/does-not-exist` (no header) → `401 unauthorized`.
   - `curl localhost:3000/meetings/does-not-exist -H "Authorization: Bearer <token>"` → `404 not found` (proves the middleware let a valid session through to the existing handler).
   - `curl localhost:3000/meetings/does-not-exist -H "Authorization: Bearer garbage"` → `401 unauthorized`.
   - `curl localhost:3000/health` (no header) → `200` (confirms it's still public).
