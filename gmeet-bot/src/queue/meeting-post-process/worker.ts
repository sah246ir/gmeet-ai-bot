import { Worker, type Job } from "bullmq";
import { MeetingStatus } from "@prisma/client";
import { connection } from "../connection.js";
import { prisma } from "../../lib/prisma.js";
import { addMeetingStatusLog } from "../../http/modules/meeting/meeting.service.js";
import { MEETING_POST_PROCESS_QUEUE } from "./queue.js";
import {
    stopTranscriptionSession,
    destroyMeetingContainer,
    indexMeetingTranscript,
    generateMeetingSummary,
} from "./utils.js";
import type { MeetingPostProcessJobData } from "./types.js";

export async function processMeetingPostProcess(job: Job<MeetingPostProcessJobData>) {
    const { meetingId } = job.data;

    await stopTranscriptionSession(meetingId);
    await destroyMeetingContainer(meetingId);

    const [segments, meeting] = await Promise.all([
        prisma.transcriptSegment.findMany({ where: { meetingId }, orderBy: { startTime: "asc" } }),
        prisma.meeting.findFirstOrThrow({ where: { id: meetingId } }),
    ]);

    await indexMeetingTranscript(meetingId, segments, meeting.sessionToken);
    await generateMeetingSummary(meetingId, segments);

    await addMeetingStatusLog(meetingId, MeetingStatus.COMPLETED);
}

export const meetingPostProcessWorker = new Worker<MeetingPostProcessJobData>(
    MEETING_POST_PROCESS_QUEUE,
    processMeetingPostProcess,
    { connection },
);

meetingPostProcessWorker.on("failed", async (job, err) => {
    if (!job) return;
    console.error(`[meeting-post-process] job ${job.id} (meeting ${job.data.meetingId}) failed:`, err);
});
