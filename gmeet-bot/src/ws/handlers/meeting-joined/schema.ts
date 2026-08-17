import { z } from "zod";

export const meetingJoinedSchema = z.object({
  type: z.literal("meeting-joined"),
  meetingId: z.string(),
});

export type MeetingJoinedSchemaType = z.infer<typeof meetingJoinedSchema>;
