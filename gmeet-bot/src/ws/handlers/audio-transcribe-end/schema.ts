import { z } from "zod";

export const audioTranscribeEndSchema = z.object({
  type: z.literal("audio-transcribe-end"),
  meetingId: z.string(),
});

export type AudioTranscribeEndSchemaType = z.infer<typeof audioTranscribeEndSchema>;
