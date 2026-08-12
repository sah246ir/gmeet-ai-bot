import z from "zod"
import { audioTranscribeChunkSchema } from "./audio-transcribe-chunk/schema"

export const WSEventSchema = z.discriminatedUnion(
    "type",
    [
        audioTranscribeChunkSchema
    ]
)