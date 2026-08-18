import { Worker, type Job } from "bullmq";
import { MeetingEvent } from "@prisma/client";
import { connection } from "../connection.js";
import { prisma } from "../../lib/prisma.js";
import { addMeetingEvent } from "../../http/modules/meeting/meeting.service.js";
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

    const isLastAttempt = (job.attemptsMade ?? 0) + 1 >= (job.opts.attempts ?? 1);
    await indexMeetingTranscript(meetingId, segments, meeting.sessionToken, isLastAttempt);
    await generateMeetingSummary(meetingId, segments);

    await addMeetingEvent(meetingId, MeetingEvent.COMPLETED);
}

export const meetingPostProcessWorker = new Worker<MeetingPostProcessJobData>(
    MEETING_POST_PROCESS_QUEUE,
    processMeetingPostProcess,
    { connection },
);
meetingPostProcessWorker.on("ready",()=>{
    console.log("meeting post process worker is listening for events")
})
meetingPostProcessWorker.on("failed", async (job, err) => {
    if (!job) return;
    console.error(`[meeting-post-process] job ${job.id} (meeting ${job.data.meetingId}) failed:`, err);

    // BullMQ fires "failed" on every failed attempt, not just the last one -
    // attemptsMade is already incremented for this attempt by the time this
    // listener runs, so this is the same "was this the last attempt" check
    // BullMQ itself used internally to decide whether to retry.
    const isFinalFailure = job.attemptsMade >= (job.opts.attempts ?? 1);
    if (!isFinalFailure) return;

    await addMeetingEvent(
        job.data.meetingId,
        MeetingEvent.FAILED,
        "FAILED",
        err instanceof Error ? err.message : "meeting processing failed",
    ).catch((e) => console.error(`[meeting-post-process] failed to record FAILED status:`, e));
});
