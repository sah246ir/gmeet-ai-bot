import { prisma } from "../../../lib/prisma.js";
import { MeetingEvent, MeetingLogStatus } from "@prisma/client";
import { dockerService } from "../../../services/docker/docker.js";
import { broadcast } from "../../../index.js";
import { updateMeetingLogStatus } from "./meeting.utils.js";

export async function createMeeting(sessionToken: string, url: string) {
    const meeting = await prisma.meeting.create({
        data: {
            url,
            sessionToken,
            statusLogs: {
                create: { event: MeetingEvent.STARTING },
            },
        },
    });

    try {
        await addMeetingEvent(meeting.id, MeetingEvent.CREATING_JOINEE_BOT);

        const { containerId } = await dockerService.createContainer({
            meetingId: meeting.id,
            meetingUrl: meeting.url,
        });
        console.log("container",containerId)
        await setMeetingContainerId(meeting.id, containerId);
    } catch (error) {
        console.log(error)
        await addMeetingEvent(
            meeting.id,
            MeetingEvent.FAILED,
            "FAILED",
            error instanceof Error ? error.message : "failed to create sandbox container",
        );
    }
    return (await getOwnedMeetingOrNull(meeting.id, sessionToken))!;
}

export async function addMeetingEvent(
    meetingId: string,
    event: MeetingEvent,
    status: MeetingLogStatus = "SUCCESS",
    error?: string,
) {
    const statusLog = await updateMeetingLogStatus(meetingId, event, status, error);
    broadcast({ type: "meeting-status", meetingId, statusLog });
    return statusLog;
}

export async function setMeetingContainerId(meetingId: string, containerId: string) {
    return prisma.meeting.update({
        where: { id: meetingId },
        data: { containerId },
    });
}

export async function listMeetingsForSession(sessionToken: string) {
    return prisma.meeting.findMany({
        where: { sessionToken },
        orderBy: { createdAt: "desc" },
        include: {
            // No `take` limit: the frontend needs enough rows to skip past
            // job-type events (INDEX_PINECONE, GENERATE_SUMMARY, ...) to find
            // the latest *lifecycle* event, not just the single latest row.
            statusLogs: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
}

export async function getOwnedMeetingOrNull(meetingId: string, sessionToken: string) {
    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
            statusLogs: { orderBy: { createdAt: "desc" } },
        },
    });

    if (!meeting || meeting.sessionToken !== sessionToken) {
        return null;
    }

    return meeting;
}

export async function assertMeetingOwnership(meetingId: string, sessionToken: string) {
    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        select: { id: true, sessionToken: true },
    });

    if (!meeting || meeting.sessionToken !== sessionToken) {
        return null;
    }

    return meeting;
}

export async function getMeetingTranscripts(meetingId: string) {
    return prisma.transcriptSegment.findMany({
        where: { meetingId },
        orderBy: { startTime: "asc" },
    });
}

export async function getMeetingInsight(meetingId: string) {
    return prisma.meetingInsight.findUnique({ where: { meetingId } });
}

export function endMeeting(meetingId: string): void {
    broadcast({ type: "meeting-end", meetingId });
}
