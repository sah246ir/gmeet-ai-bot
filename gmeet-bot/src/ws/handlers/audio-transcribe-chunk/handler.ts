import { TranscribeManager } from "../../..";
import { prisma } from "../../../lib/prisma";
import { AudioTranscribeChunkSchemaType } from "./schema";

export const audioTranscribeChunkHandler = async (event:AudioTranscribeChunkSchemaType)=>{
    console.log(event.index)
    // let client = TranscribeManager.getInstance(event.meetingId)
    // if(client===undefined){
    //     client = await TranscribeManager.createInstance(event.meetingId)
    //     client.onTranscript(async(event)=>{
    //         if(!event.isFinal) return
    //         console.log(event.text)
    //         const words = event.words.map((w) => ({ word: w.word, speaker: w.speaker }))
    //         await prisma.transcriptSegment.create({
    //             data:{
    //                 meetingId:event.meetingId,
    //                 startTime:event.start,
    //                 endTime:event.start + event.duration,
    //                 text:event.text,
    //                 words,
    //             }
    //         })
    //     })
    // }

    // await client.sendAudio(Buffer.from(event.data, "base64"))
}