import { MeetingEvent } from "@prisma/client";
import { addMeetingEvent } from "../../../http/modules/meeting/meeting.service.js";
import { MeetingJoinedSchemaType } from "./schema.js";

export const meetingJoinedHandler = async (event: MeetingJoinedSchemaType) => {
    await addMeetingEvent(event.meetingId, MeetingEvent.MEETING_PROCESSED);
};
