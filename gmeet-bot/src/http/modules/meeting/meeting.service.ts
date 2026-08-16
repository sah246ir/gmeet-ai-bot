import { prisma } from "../../../lib/prisma.js";
import { MeetingStatus } from "@prisma/client";

export async function createMeeting(sessionToken: string, url: string) {
    return prisma.meeting.create({
        data: {
            url,
            sessionToken,
            statusLogs: {
                create: { status: MeetingStatus.STARTING },
            },
        },
        include: {
            statusLogs: true,
        },
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
