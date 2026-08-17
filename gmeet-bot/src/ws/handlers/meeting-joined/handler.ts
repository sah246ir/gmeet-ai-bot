import { MeetingStatus } from "@prisma/client";
import { addMeetingStatusLog } from "../../../http/modules/meeting/meeting.service.js";
import { MeetingJoinedSchemaType } from "./schema.js";

export const meetingJoinedHandler = async (event: MeetingJoinedSchemaType) => {
    await addMeetingStatusLog(event.meetingId, MeetingStatus.MEETING_PROCESSED);
};
