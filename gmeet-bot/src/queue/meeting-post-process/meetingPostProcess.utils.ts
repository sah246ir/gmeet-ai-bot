import { MeetingStatus, JobType, JobStatus } from "@prisma/client";
import type { TranscriptSegment } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { addMeetingStatusLog } from "../../http/modules/meeting/meeting.service.js";
import { TranscribeManager } from "../../index.js";
import { dockerService } from "../../services/docker/docker.js";
import { groupTranscripts } from "../../lib/group-transcripts.js";
import { buildFullMeetingContext, countDistinctSpeakers } from "../../lib/transcript-format.js";
import { RagService } from "../../lib/rag.js";

export async function markJobStep(meetingId: string, type: JobType, status: JobStatus, error?: string | null) {
    await prisma.job.upsert({
        where: { meetingId_type: { meetingId, type } },
        create: { meetingId, type, status, error: error ?? null },
        update: { status, error: error ?? null },
    });
}

export async function stopTranscriptionSession(meetingId: string) {
    await TranscribeManager.removeInstance(meetingId);
}

export async function destroyMeetingContainer(meetingId: string) {
    try {
        await dockerService.destroyContainer(meetingId);
    } catch (error) {
        console.warn(
            `[meeting-post-process] destroyContainer(${meetingId}) skipped:`,
            error instanceof Error ? error.message : error,
        );
    }
}

// Required step - meeting search depends on this, so a failure fails the
// whole job (BullMQ retries it) and marks the meeting FAILED.
export async function indexMeetingTranscript(
    meetingId: string,
    segments: TranscriptSegment[],
    sessionToken: string,
) {
    await markJobStep(meetingId, JobType.INDEX_PINECONE, JobStatus.RUNNING);
    try {
        const chunks = groupTranscripts(segments, meetingId, sessionToken);
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
}

// Best-effort step - failure is caught and recorded but never blocks the
// meeting from completing.
export async function generateMeetingSummary(meetingId: string, segments: TranscriptSegment[]) {
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
}
