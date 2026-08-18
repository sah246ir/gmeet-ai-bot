import { AudioTranscribeEndSchemaType } from "./schema.js";
import { enqueueMeetingPostProcess } from "../../../queue/meeting-post-process/queue.js";

export const audioTranscribeEndHandler = async (event: AudioTranscribeEndSchemaType) => {
    await enqueueMeetingPostProcess(event.meetingId);
}
