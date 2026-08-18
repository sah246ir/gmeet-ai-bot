import { Worker, type Job } from "bullmq";
import { MeetingStatus, JobType, JobStatus } from "@prisma/client";
import { connection } from "../connection.js";
import { prisma } from "../../lib/prisma.js";
import { addMeetingStatusLog } from "../../http/modules/meeting/meeting.service.js";
import { TranscribeManager } from "../../index.js";
import { dockerService } from "../../services/docker/docker.js";
import { groupTranscripts } from "../../lib/group-transcripts.js";
import { buildFullMeetingContext, countDistinctSpeakers } from "../../lib/transcript-format.js";
import { RagService } from "../../lib/rag.js";
import { MEETING_POST_PROCESS_QUEUE } from "./meetingPostProcess.queue.js";
import type { MeetingPostProcessJobData } from "./types.js";

async function markJobStep(meetingId: string, type: JobType, status: JobStatus, error?: string | null) {
    await prisma.job.upsert({
        where: { meetingId_type: { meetingId, type } },
        create: { meetingId, type, status, error: error ?? null },
        update: { status, error: error ?? null },
    });
}

export async function processMeetingPostProcess(job: Job<MeetingPostProcessJobData>) {
    const { meetingId } = job.data;

    await TranscribeManager.removeInstance(meetingId);

    try {
        await dockerService.destroyContainer(meetingId);
    } catch (error) {
        console.warn(
            `[meeting-post-process] destroyContainer(${meetingId}) skipped:`,
            error instanceof Error ? error.message : error,
        );
    }

    const [segments, meeting] = await Promise.all([
        prisma.transcriptSegment.findMany({ where: { meetingId }, orderBy: { startTime: "asc" } }),
        prisma.meeting.findFirstOrThrow({ where: { id: meetingId } }),
    ]);

    await markJobStep(meetingId, JobType.INDEX_PINECONE, JobStatus.RUNNING);
    try {
        const chunks = groupTranscripts(segments, meetingId, meeting.sessionToken);
        if (chunks.length > 0) {
            await RagService.pineconeService.upsertChunk(chunks);
        }
        await markJobStep(meetingId, JobType.INDEX_PINECONE, JobStatus.COMPLETED);
    } catch (error) {
        const message = error instanceof Error ? error.message : "failed to index meeting transcript";
        await markJobStep(meetingId, JobType.INDEX_PINECONE, JobStatus.FAILED, message);
        await addMeetingStatusLog(meetingId, MeetingStatus.FAILED, message);
        throw error;
    }

    await markJobStep(meetingId, JobType.GENERATE_SUMMARY, JobStatus.RUNNING);
    try {
        const context = buildFullMeetingContext(segments);
        if (context.trim().length > 0) {
            const speakerCount = countDistinctSpeakers(segments);
            const summary = await RagService.llmService.summarize(context);
            await prisma.meetingInsight.upsert({
                where: { meetingId },
                create: { meetingId, speakerCount, ...summary },
                update: { speakerCount, ...summary },
            });
        }
        await markJobStep(meetingId, JobType.GENERATE_SUMMARY, JobStatus.COMPLETED);
    } catch (error) {
        const message = error instanceof Error ? error.message : "failed to generate meeting summary";
        console.error(`[meeting-post-process] summary generation failed for ${meetingId}:`, error);
        await markJobStep(meetingId, JobType.GENERATE_SUMMARY, JobStatus.FAILED, message);
    }

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
