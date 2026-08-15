import { TranscribeManager } from "../../..";
import { AudioTranscribeEndSchemaType } from "./schema";

export const audioTranscribeEndHandler = (event: AudioTranscribeEndSchemaType) => {
    console.log("end")
    // const client = TranscribeManager.getInstance(event.meetingId)
    // if (client === undefined) return

    // client.stopSession()
    // TranscribeManager.removeInstance(event.meetingId)
}
