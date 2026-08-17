import { MeetingStatus } from "@prisma/client";
import { addMeetingStatusLog } from "../../../http/modules/meeting/meeting.service.js";
import { MeetingJoiningSchemaType } from "./schema.js";

export const meetingJoiningHandler = async (event: MeetingJoiningSchemaType) => {
    await addMeetingStatusLog(event.meetingId, MeetingStatus.JOINING_MEETING);
};
