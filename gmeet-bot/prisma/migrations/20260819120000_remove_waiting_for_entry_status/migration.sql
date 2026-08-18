-- Drop historical rows for the removed WAITING_FOR_ENTRY event so the enum
-- column can be recreated without that value.
DELETE FROM "MeetingStatusLog" WHERE "event" = 'WAITING_FOR_ENTRY';

-- AlterEnum
BEGIN;
CREATE TYPE "MeetingEvent_new" AS ENUM ('STARTING', 'CREATING_JOINEE_BOT', 'JOINING_MEETING', 'MEETING_PROCESSED', 'PROCESS_TRANSCRIPT', 'GENERATE_EMBEDDINGS', 'INDEX_PINECONE', 'GENERATE_SUMMARY', 'EXTRACT_ACTION_ITEMS', 'COMPLETED', 'FAILED');
ALTER TABLE "MeetingStatusLog" ALTER COLUMN "event" TYPE "MeetingEvent_new" USING ("event"::text::"MeetingEvent_new");
ALTER TYPE "MeetingEvent" RENAME TO "MeetingEvent_old";
ALTER TYPE "MeetingEvent_new" RENAME TO "MeetingEvent";
DROP TYPE "public"."MeetingEvent_old";
COMMIT;
