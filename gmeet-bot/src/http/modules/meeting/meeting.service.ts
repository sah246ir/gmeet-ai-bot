import { prisma } from "../../../lib/prisma.js";
import { MeetingStatus } from "@prisma/client";
import { dockerService } from "../../../services/docker/docker.js";
import { broadcast } from "../../..";

export async function createMeeting(sessionToken: string, url: string) {
    const meeting = await prisma.meeting.create({
        data: {
            url,
            sessionToken,
            statusLogs: {
                create: { status: MeetingStatus.STARTING },
            },
        },
    });

    try {
        await addMeetingStatusLog(meeting.id, MeetingStatus.CREATING_JOINEE_BOT);

        const { containerId } = await dockerService.createContainer({
            meetingId: meeting.id,
            meetingUrl: meeting.url,
        });

        await setMeetingContainerId(meeting.id, containerId);
        await addMeetingStatusLog(meeting.id, MeetingStatus.JOINING_MEETING);
    } catch (error) {
        await addMeetingStatusLog(
            meeting.id,
            MeetingStatus.FAILED,
            error instanceof Error ? error.message : "failed to create sandbox container",
        );
    }

    return (await getOwnedMeetingOrNull(meeting.id, sessionToken))!;
}

export async function addMeetingStatusLog(meetingId: string, status: MeetingStatus, error?: string) {
    return prisma.meetingStatusLog.create({
        data: { meetingId, status, error },
    });
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
            statusLogs: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });
}

export async function getOwnedMeetingOrNull(meetingId: string, sessionToken: string) {
    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
            jobs: true,
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

export function endMeeting(meetingId: string): void {
    broadcast({ type: "meeting-end", meetingId });
}
