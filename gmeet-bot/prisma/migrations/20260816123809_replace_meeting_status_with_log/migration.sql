/*
  Warnings:

  - You are about to drop the column `status` on the `Meeting` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('STARTING', 'CREATING_JOINEE_BOT', 'JOINING_MEETING', 'PROCESSING_MEETING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "status";

-- CreateTable
CREATE TABLE "MeetingStatusLog" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "status" "MeetingStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingStatusLog_meetingId_createdAt_idx" ON "MeetingStatusLog"("meetingId", "createdAt");

-- AddForeignKey
ALTER TABLE "MeetingStatusLog" ADD CONSTRAINT "MeetingStatusLog_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
