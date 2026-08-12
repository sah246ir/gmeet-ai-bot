import z from "zod"
import { audioTranscribeChunkSchema } from "./audio-transcribe-chunk/schema"
import { audioTranscribeEndSchema } from "./audio-transcribe-end/schema"

export const WSEventSchema = z.discriminatedUnion(
    "type",
    [
        audioTranscribeChunkSchema,
        audioTranscribeEndSchema
    ]
)