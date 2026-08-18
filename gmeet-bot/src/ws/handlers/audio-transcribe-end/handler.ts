import { MeetingStatus } from "@prisma/client";
import { addMeetingStatusLog } from "../../../http/modules/meeting/meeting.service.js";
import { AudioTranscribeEndSchemaType } from "./schema.js";
import { enqueueMeetingPostProcess } from "../../../queue/meeting-post-process/queue.js";

export const audioTranscribeEndHandler = async (event: AudioTranscribeEndSchemaType) => {
    await addMeetingStatusLog(event.meetingId, MeetingStatus.PROCESSING_MEETING);
    await enqueueMeetingPostProcess(event.meetingId);
}
