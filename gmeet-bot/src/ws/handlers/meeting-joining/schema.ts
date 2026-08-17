import { z } from "zod";

export const meetingJoiningSchema = z.object({
  type: z.literal("meeting-joining"),
  meetingId: z.string(),
});

export type MeetingJoiningSchemaType = z.infer<typeof meetingJoiningSchema>;
