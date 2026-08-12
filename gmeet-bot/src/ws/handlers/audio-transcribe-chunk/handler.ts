import { TranscribeManager } from "../../..";
import { AudioTranscribeChunkSchemaType } from "./schema";

export const audioTranscribeChunkHandler = async (event:AudioTranscribeChunkSchemaType)=>{
    let client = TranscribeManager.getInstance(event.meetingId)
    if(client===undefined){
        client = await TranscribeManager.createInstance(event.meetingId)
        client.onTranscript((event)=>{
            console.log(event.text)
        })
    }

    await client.sendAudio(Buffer.from(event.data, "base64"))
    
}