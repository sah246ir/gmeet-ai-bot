import { TranscribeManager } from "../../..";
import { prisma } from "../../../lib/prisma";
import { AudioTranscribeChunkSchemaType } from "./schema";

export const audioTranscribeChunkHandler = async (event:AudioTranscribeChunkSchemaType)=>{
    let client = TranscribeManager.getInstance(event.meetingId)
    if(client===undefined){
        client = await TranscribeManager.createInstance(event.meetingId)
        client.onTranscript(async(event)=>{
            if(!event.isFinal) return
            await prisma.transcriptSegment.create({
                data:{
                    meetingId:event.meetingId,
                    startTime:event.start,
                    endTime:event.start + event.duration,
                    text:event.text,
                }
            })
            
        })
    }

    await client.sendAudio(Buffer.from(event.data, "base64"))
    
}