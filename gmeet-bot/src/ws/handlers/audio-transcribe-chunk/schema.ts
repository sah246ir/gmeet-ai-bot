import { z } from "zod";

export const audioTranscribeChunkSchema = z.object({
  type: z.literal("audio-transcribe-chunk"),
  data: z.string(),
  meetingId: z.string(),
  index: z.number(),
});

export type AudioTranscribeChunkSchemaType = z.infer<typeof audioTranscribeChunkSchema>;