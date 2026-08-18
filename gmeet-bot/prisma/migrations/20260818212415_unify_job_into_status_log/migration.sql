-- CreateEnum
CREATE TYPE "MeetingEvent" AS ENUM ('STARTING', 'CREATING_JOINEE_BOT', 'JOINING_MEETING', 'WAITING_FOR_ENTRY', 'MEETING_PROCESSED', 'PROCESS_TRANSCRIPT', 'GENERATE_EMBEDDINGS', 'INDEX_PINECONE', 'GENERATE_SUMMARY', 'EXTRACT_ACTION_ITEMS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MeetingLogStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "MeetingState" AS ENUM ('PENDING', 'DONE', 'FAILED');

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_meetingId_fkey";

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "state" "MeetingState" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "MeetingStatusLog" ADD COLUMN     "closingState" TIMESTAMP(3),
ADD COLUMN     "event" "MeetingEvent" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "MeetingLogStatus" NOT NULL DEFAULT 'SUCCESS';

-- DropTable
DROP TABLE "Job";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "JobType";

-- DropEnum
DROP TYPE "MeetingStatus";

-- CreateIndex
CREATE INDEX "MeetingStatusLog_meetingId_event_createdAt_idx" ON "MeetingStatusLog"("meetingId", "event", "createdAt");

