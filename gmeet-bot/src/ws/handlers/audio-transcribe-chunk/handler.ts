import { TranscribeManager, broadcast } from "../../../index.js";
import { prisma } from "../../../lib/prisma.js";
import { AudioTranscribeChunkSchemaType } from "./schema.js";

export const audioTranscribeChunkHandler = async (event:AudioTranscribeChunkSchemaType)=>{
    const client = await TranscribeManager.getInstance(event.meetingId, async(transcriptEvent)=>{
        if(!transcriptEvent.isFinal) return
        const words = transcriptEvent.words.map((w) => ({ word: w.word, speaker: w.speaker }))
        const segment = await prisma.transcriptSegment.create({
            data:{
                meetingId:transcriptEvent.meetingId,
                startTime:transcriptEvent.start,
                endTime:transcriptEvent.start + transcriptEvent.duration,
                text:transcriptEvent.text,
                words,
            }
        })
        broadcast({ type: "live-transcript", meetingId: transcriptEvent.meetingId, segment })
    })

    await client.sendAudio(Buffer.from(event.data, "base64"))
}
