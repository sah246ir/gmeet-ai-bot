/*
  Warnings:

  - Added the required column `type` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PROCESS_TRANSCRIPT', 'GENERATE_EMBEDDINGS', 'INDEX_PINECONE', 'GENERATE_SUMMARY', 'EXTRACT_ACTION_ITEMS');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "type" "JobType" NOT NULL;

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "speakerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranscriptSegment_meetingId_startTime_idx" ON "TranscriptSegment"("meetingId", "startTime");

-- CreateIndex
CREATE INDEX "Job_meetingId_type_idx" ON "Job"("meetingId", "type");

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
