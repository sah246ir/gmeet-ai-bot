import { MeetingEvent, MeetingLogStatus, MeetingState, MeetingStatusLog } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

// Only the two top-level terminal events move Meeting.state - every other
// event (lifecycle or job) leaves it untouched.
export function deriveMeetingState(event: MeetingEvent): MeetingState | null {
    if (event === "COMPLETED") return "DONE";
    if (event === "FAILED") return "FAILED";
    return null;
}

export async function updateMeetingLogStatus(
    meetingId: string,
    event: MeetingEvent,
    status: MeetingLogStatus = "SUCCESS",
    error?: string,
): Promise<MeetingStatusLog> {
    const state = deriveMeetingState(event);

    // If this event previously had an open PENDING row (a job step starting,
    // or - harmlessly a no-op otherwise - any other event), stamp its
    // closingState now that we're writing its resolution. Gives duration
    // ("closingState - createdAt") without joining two rows together.
    const openPending = await prisma.meetingStatusLog.findFirst({
        where: { meetingId, event, status: "PENDING", closingState: null },
        orderBy: { createdAt: "desc" },
    });

    const [statusLog] = await prisma.$transaction([
        prisma.meetingStatusLog.create({ data: { meetingId, event, status, error } }),
        ...(openPending
            ? [
                  prisma.meetingStatusLog.update({
                      where: { id: openPending.id },
                      data: { closingState: new Date() },
                  }),
              ]
            : []),
        ...(state
            ? [prisma.meeting.update({ where: { id: meetingId }, data: { state, completedAt: new Date() } })]
            : []),
    ]);

    return statusLog;
}
