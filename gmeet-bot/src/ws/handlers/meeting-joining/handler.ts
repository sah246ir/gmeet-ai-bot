import { MeetingEvent } from "@prisma/client";
import { addMeetingEvent } from "../../../http/modules/meeting/meeting.service.js";
import { MeetingJoiningSchemaType } from "./schema.js";

export const meetingJoiningHandler = async (event: MeetingJoiningSchemaType) => {
    await addMeetingEvent(event.meetingId, MeetingEvent.JOINING_MEETING);
};
