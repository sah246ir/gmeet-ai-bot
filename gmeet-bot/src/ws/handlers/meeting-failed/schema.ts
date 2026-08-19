import { z } from "zod";

export const meetingFailedSchema = z.object({
  type: z.literal("meeting-failed"),
  meetingId: z.string(),
  error: z.string(),
});

export type MeetingFailedSchemaType = z.infer<typeof meetingFailedSchema>;
