-- DropIndex
DROP INDEX "Job_meetingId_type_idx";

-- CreateTable
CREATE TABLE "MeetingInsight" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "keyPoints" JSONB NOT NULL,
    "decisions" JSONB NOT NULL,
    "actionItems" JSONB NOT NULL,
    "speakerCount" INTEGER NOT NULL,
    "speakers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingInsight_meetingId_key" ON "MeetingInsight"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_meetingId_type_key" ON "Job"("meetingId", "type");

-- AddForeignKey
ALTER TABLE "MeetingInsight" ADD CONSTRAINT "MeetingInsight_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

