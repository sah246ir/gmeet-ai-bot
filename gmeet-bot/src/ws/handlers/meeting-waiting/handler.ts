import { MeetingEvent } from "@prisma/client";
import { addMeetingEvent } from "../../../http/modules/meeting/meeting.service.js";
import { MeetingWaitingSchemaType } from "./schema.js";

export const meetingWaitingHandler = async (event: MeetingWaitingSchemaType) => {
    await addMeetingEvent(event.meetingId, MeetingEvent.WAITING_FOR_ENTRY);
};
