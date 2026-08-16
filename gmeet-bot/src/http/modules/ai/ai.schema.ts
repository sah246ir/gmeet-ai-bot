import { z } from "zod";

export const meetingQuerySchema = z.object({
    question: z.string().trim().min(1, "question is required"),
});

export type MeetingQuerySchemaType = z.infer<typeof meetingQuerySchema>;

export const meetingIdParamsSchema = z.object({
    id: z.string().min(1),
});

export type MeetingIdParamsSchemaType = z.infer<typeof meetingIdParamsSchema>;
