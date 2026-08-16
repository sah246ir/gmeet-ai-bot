/*
  Warnings:

  - Added the required column `sessionToken` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "sessionToken" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Meeting_sessionToken_idx" ON "Meeting"("sessionToken");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_sessionToken_fkey" FOREIGN KEY ("sessionToken") REFERENCES "Session"("token") ON DELETE RESTRICT ON UPDATE CASCADE;
