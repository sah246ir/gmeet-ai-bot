import { MeetingEvent } from "@prisma/client";
import type { TranscriptSegment } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { addMeetingEvent } from "../../http/modules/meeting/meeting.service.js";
import { TranscribeManager } from "../../index.js";
import { dockerService } from "../../services/docker/docker.js";
import { groupTranscripts } from "../../lib/group-transcripts.js";
import { buildFullMeetingContext, countDistinctSpeakers } from "../../lib/transcript-format.js";
import { RagService } from "../../lib/rag.js";

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
// whole job (BullMQ retries it). Only logged as a FAILED event once this is
// the job's last attempt, so the log doesn't call a step "failed" while
// BullMQ is still quietly retrying it in the background.
export async function indexMeetingTranscript(
    meetingId: string,
    segments: TranscriptSegment[],
    sessionToken: string,
    isLastAttempt: boolean,
) {
    await addMeetingEvent(meetingId, MeetingEvent.INDEX_PINECONE, "PENDING");
    try {
        const chunks = groupTranscripts(segments, meetingId, sessionToken);
        if (chunks.length > 0) {
            await RagService.pineconeService.upsertChunk(chunks);
        }
        await addMeetingEvent(meetingId, MeetingEvent.INDEX_PINECONE, "SUCCESS");
    } catch (error) {
        const message = error instanceof Error ? error.message : "failed to index meeting transcript";
        if (isLastAttempt) {
            await addMeetingEvent(meetingId, MeetingEvent.INDEX_PINECONE, "FAILED", message);
        }
        throw error;
    }
}

// Best-effort step - failure is caught and recorded but never blocks the
// meeting from completing. Never rethrows, so it doesn't trigger BullMQ
// retries on its own - its FAILED log is already final the moment it's written.
export async function generateMeetingSummary(meetingId: string, segments: TranscriptSegment[]) {
    await addMeetingEvent(meetingId, MeetingEvent.GENERATE_SUMMARY, "PENDING");
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
        await addMeetingEvent(meetingId, MeetingEvent.GENERATE_SUMMARY, "SUCCESS");
    } catch (error) {
        const message = error instanceof Error ? error.message : "failed to generate meeting summary";
        console.error(`[meeting-post-process] summary generation failed for ${meetingId}:`, error);
        await addMeetingEvent(meetingId, MeetingEvent.GENERATE_SUMMARY, "FAILED", message);
    }
}
