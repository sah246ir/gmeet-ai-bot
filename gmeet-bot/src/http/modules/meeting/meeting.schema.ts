import { z } from "zod";

const GOOGLE_MEET_URL_REGEX = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?.*)?$/i;

export const createMeetingSchema = z.object({
    url: z.string().trim().regex(GOOGLE_MEET_URL_REGEX, "must be a valid Google Meet URL"),
});

export type CreateMeetingSchemaType = z.infer<typeof createMeetingSchema>;

export const meetingIdParamsSchema = z.object({
    id: z.string().min(1),
});

export type MeetingIdParamsSchemaType = z.infer<typeof meetingIdParamsSchema>;
