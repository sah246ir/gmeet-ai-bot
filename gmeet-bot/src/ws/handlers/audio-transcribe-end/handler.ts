import { MeetingStatus } from "@prisma/client";
import { TranscribeManager } from "../../../index.js";
import { addMeetingStatusLog } from "../../../http/modules/meeting/meeting.service.js";
import { AudioTranscribeEndSchemaType } from "./schema.js";
import { RagService } from "../../../lib/rag.js";
import { groupTranscripts } from "../../../lib/group-transcripts.js";
import { prisma } from "../../../lib/prisma.js";
import { dockerService } from "../../../services/docker/docker.js";

export const audioTranscribeEndHandler = async (event: AudioTranscribeEndSchemaType) => {
    console.log("end")
    await addMeetingStatusLog(event.meetingId, MeetingStatus.PROCESSING_MEETING);
    const client = TranscribeManager.getInstance(event.meetingId)
    if (client === undefined) return
    const meetingTranscript = await prisma.transcriptSegment.findMany({
        where:{
            meetingId:event.meetingId
        }
    })
    const meeting = await prisma.meeting.findFirstOrThrow({
        where:{
            id:event.meetingId
        }
    })
    client.stopSession()
    TranscribeManager.removeInstance(event.meetingId)
    const session = dockerService.destroyContainer(event.meetingId)
    const transcribe = groupTranscripts(meetingTranscript,event.meetingId,meeting.sessionToken)

    try {
        await RagService.pineconeService.upsertChunk(transcribe)
        await addMeetingStatusLog(event.meetingId, MeetingStatus.COMPLETED);
    } catch (error) {
        console.log(error)
        await addMeetingStatusLog(
            event.meetingId,
            MeetingStatus.FAILED,
            error instanceof Error ? error.message : "failed to process meeting transcript",
        );
    }
}
