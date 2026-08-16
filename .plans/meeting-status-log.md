# Replace Meeting.status with a MeetingStatusLog table

## Context

`Meeting` had a single `status` field typed as the shared `JobStatus` enum (`PENDING`/`RUNNING`/`COMPLETED`/`FAILED`) — the same enum `Job.status` uses. That's too generic for the meeting lifecycle specifically, and a single overwritable field throws away history: there's no record of *when* a meeting moved from one state to the next, only whatever it currently is. This adds a dedicated `MeetingStatus` enum with the actual lifecycle states a meeting bot goes through, and — since the status needs to be maintained as a log — a new append-only `MeetingStatusLog` table (FK'd to `Meeting`) that records every transition, rather than a single mutable column.

**Confirmed decision:** `Meeting.status` is removed entirely — there is no denormalized "current status" column on `Meeting`. The log table is the sole source of truth; "current status" is always the most recent `MeetingStatusLog` row for that meeting (`ORDER BY createdAt DESC LIMIT 1`).

## Design

### 1. Prisma schema — `gmeet-bot/prisma/schema.prisma`
- New enum, named distinctly from `JobStatus` since it's a different lifecycle:
```prisma
enum MeetingStatus {
  STARTING
  CREATING_JOINEE_BOT
  JOINING_MEETING
  PROCESSING_MEETING
  COMPLETED
  FAILED
}
```
- `Meeting.status` removed; `Meeting.statusLogs MeetingStatusLog[]` added (matches the existing `jobs Job[]` / `transcriptSegments TranscriptSegment[]` inverse-relation pattern).
- New append-only log table, following the `TranscriptSegment` formatting convention (`createdAt` only, no `updatedAt`), with an optional `error` field mirroring `Job.error` for capturing failure context:
```prisma
model MeetingStatusLog {
  id        String        @id @default(cuid())

  meetingId String
  meeting   Meeting       @relation(fields: [meetingId], references: [id])

  status    MeetingStatus
  error     String?

  createdAt DateTime      @default(now())

  @@index([meetingId, createdAt])
}
```
- `JobStatus` and `Job` are untouched.

### 2. Route follow-up — `gmeet-bot/src/http/routes.ts`
`GET /meetings/:id` now includes `statusLogs` (ordered newest-first) alongside `jobs`, so removing the `status` field doesn't silently drop status information from the response. `meeting.statusLogs[0]` is the current status for any consumer that wants it; the full array is the history.

### Out of scope (flagged, not built)
Nothing in this codebase yet creates `Meeting` rows or writes `MeetingStatusLog` entries — there's no orchestration code that joins a meeting and would emit `STARTING` → `CREATING_JOINEE_BOT` → `JOINING_MEETING` → `PROCESSING_MEETING` → `COMPLETED`/`FAILED` transitions. This only adds the data model and keeps existing code consistent with it; wiring actual status writes into a future meeting-orchestration flow is separate work.

## Verification
1. `npx prisma migrate dev --name replace_meeting_status_with_log` — applied against the live DB (safe, `Meeting` table was empty).
2. `npx tsc -b --force` — confirms everything typechecks.
3. Server smoke test: `GET /meetings/:id` for a nonexistent id with a valid session token still returns `404`.
