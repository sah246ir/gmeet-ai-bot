import { MeetingStatus } from "@prisma/client";
import { TranscribeManager } from "../../..";
import { addMeetingStatusLog } from "../../../http/modules/meeting/meeting.service.js";
import { AudioTranscribeEndSchemaType } from "./schema";

export const audioTranscribeEndHandler = async (event: AudioTranscribeEndSchemaType) => {
    console.log("end")
    await addMeetingStatusLog(event.meetingId, MeetingStatus.PROCESSING_MEETING);
    // const client = TranscribeManager.getInstance(event.meetingId)
    // if (client === undefined) return

    // client.stopSession()
    // TranscribeManager.removeInstance(event.meetingId)
}
