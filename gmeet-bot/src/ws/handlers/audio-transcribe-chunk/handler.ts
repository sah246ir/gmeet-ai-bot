import { TranscribeManager, broadcast } from "../../../index.js";
import { prisma } from "../../../lib/prisma.js";
import { AudioTranscribeChunkSchemaType } from "./schema.js";

export const audioTranscribeChunkHandler = async (event:AudioTranscribeChunkSchemaType)=>{
    let client = TranscribeManager.getInstance(event.meetingId)
    if(client===undefined){
        client = await TranscribeManager.createInstance(event.meetingId)
        client.onTranscript(async(event)=>{
            if(!event.isFinal) return
            const words = event.words.map((w) => ({ word: w.word, speaker: w.speaker }))
            const segment = await prisma.transcriptSegment.create({
                data:{
                    meetingId:event.meetingId,
                    startTime:event.start,
                    endTime:event.start + event.duration,
                    text:event.text,
                    words,
                }
            })
            broadcast({ type: "live-transcript", meetingId: event.meetingId, segment })
        })
    }

    await client.sendAudio(Buffer.from(event.data, "base64"))
}
