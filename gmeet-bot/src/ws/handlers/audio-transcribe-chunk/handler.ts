import { TranscribeManager } from "../../..";
import { AudioTranscribeChunkSchemaType } from "./schema";

export const audioTranscribeChunkHandler = (event:AudioTranscribeChunkSchemaType)=>{
    let client = TranscribeManager.getInstance(event.meetingId)
    if(client===undefined){
        client = TranscribeManager.createInstance(event.meetingId)
        client.onTranscript((event)=>{
            console.log(event.text)
        })
    }

    client.sendAudio(Buffer.from(event.data, "base64"))
    
}