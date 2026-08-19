import { MeetingEvent } from "@prisma/client";
import { addMeetingEvent } from "../../../http/modules/meeting/meeting.service.js";
import { MeetingFailedSchemaType } from "./schema.js";

export const meetingFailedHandler = async (event: MeetingFailedSchemaType) => {
    await addMeetingEvent(event.meetingId, MeetingEvent.FAILED, "FAILED", event.error);
};
