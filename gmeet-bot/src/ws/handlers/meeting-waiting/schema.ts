import { z } from "zod";

export const meetingWaitingSchema = z.object({
  type: z.literal("meeting-waiting"),
  meetingId: z.string(),
});

export type MeetingWaitingSchemaType = z.infer<typeof meetingWaitingSchema>;
