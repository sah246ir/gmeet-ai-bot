# Modular HTTP API: session/meeting/ai modules + 5 endpoints

## Context

gmeet-bot's HTTP layer was a single flat `src/http/routes.ts` file with a stub `POST /meetings` that validated a `url` but never created anything or sent a response. Session validation existed (`requireSession` middleware) but didn't expose *which* session was calling to route handlers, so nothing could be scoped to "the current user's own meetings." This restructures the HTTP layer into a `routes.ts` / `controller.ts` / `service.ts` / `schema.ts` module pattern (one folder per domain: `session`, `meeting`, `ai`) and adds the meeting-lifecycle endpoints: create a meeting from a Meet link, list your meetings with current status, get one meeting's full detail, get its transcript, and ask a RAG question scoped to it.

**Decisions:**
- Meeting data (list/get/transcripts/query) is scoped to the owning session — a different session's token gets `404`, not `403`.
- `POST /meetings` link validation is Google-Meet-specific (`https://meet.google.com/xxx-yyyy-zzz`).
- The RAG endpoint is `POST /meetings/:id/query`, nested under `/meetings`, handler lives in the `ai` module.
- All three modules' `service.ts` files are plain exported functions, not classes.
- `service.ts` here is the HTTP-facing business logic layer (Prisma directly, no repository layer) — distinct from `src/services/*` (deepgram/pinecone/rag/llm), which `ai.service.ts` calls into via the existing `RagService` singleton.
- `POST /meetings` only validates the link, creates the `Meeting` row, and inserts one `STARTING` `MeetingStatusLog` row (nested/atomic create). No orchestration (spinning up a joinee bot) — that's future work.
- No Prisma schema changes needed.

## Module layout
```
http/types.d.ts                          - req.sessionToken augmentation
http/modules/session/{routes,controller,service}.ts   - no schema.ts (no request body)
http/modules/meeting/{routes,controller,service,schema}.ts
http/modules/ai/{routes,controller,service,schema}.ts
```

## Endpoints
- `POST /session` — create a session token (unauthenticated).
- `POST /meetings` — validate Meet URL, create `Meeting` + `STARTING` status log, scoped to caller's session. `201`.
- `GET /meetings` — list caller's own meetings with latest status only (`take: 1` per relation).
- `GET /meetings/:id` — full detail + full status history. `404` if not found/not owned.
- `GET /meetings/:id/transcripts` — that meeting's transcript segments, ordered by `startTime`. `404` if not found/not owned.
- `POST /meetings/:id/query` — `{ question }` → `RagService.ask(meetingId, question)`. `404` if not found/not owned.

## Verification
1. `npx tsc -b --force` — clean build.
2. Full curl walkthrough: create session → create meeting (reject non-Meet URL, accept Meet URL) → list → get → transcripts (empty) → query (LLM fallback answer, no indexed chunks yet) → cross-session 404 → no-token 401.
