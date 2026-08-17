import z from "zod"
import { audioTranscribeChunkSchema } from "./audio-transcribe-chunk/schema.js"
import { audioTranscribeEndSchema } from "./audio-transcribe-end/schema.js"
import { meetingJoiningSchema } from "./meeting-joining/schema.js"
import { meetingJoinedSchema } from "./meeting-joined/schema.js"

export const WSEventSchema = z.discriminatedUnion(
    "type",
    [
        audioTranscribeChunkSchema,
        audioTranscribeEndSchema,
        meetingJoiningSchema,
        meetingJoinedSchema
    ]
)