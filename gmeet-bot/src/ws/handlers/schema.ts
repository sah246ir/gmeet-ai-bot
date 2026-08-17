import z from "zod"
import { audioTranscribeChunkSchema } from "./audio-transcribe-chunk/schema"
import { audioTranscribeEndSchema } from "./audio-transcribe-end/schema"
import { meetingJoiningSchema } from "./meeting-joining/schema"
import { meetingJoinedSchema } from "./meeting-joined/schema"

export const WSEventSchema = z.discriminatedUnion(
    "type",
    [
        audioTranscribeChunkSchema,
        audioTranscribeEndSchema,
        meetingJoiningSchema,
        meetingJoinedSchema
    ]
)