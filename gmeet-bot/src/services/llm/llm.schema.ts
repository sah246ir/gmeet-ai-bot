import { z } from "zod";

export const meetingSummarySchema = z.object({
    overview: z.string().min(1),
    keyPoints: z.array(z.string().min(1)).default([]),
    decisions: z
        .array(
            z.object({
                title: z.string().min(1),
                description: z.string().min(1),
            }),
        )
        .default([]),
    actionItems: z
        .array(
            z.object({
                owner: z.string().min(1),
                task: z.string().min(1),
                due: z.string().default(""),
            }),
        )
        .default([]),
    speakers: z
        .array(
            z.object({
                label: z.string().min(1),
                note: z.string().optional(),
            }),
        )
        .default([]),
});

export type MeetingSummaryType = z.infer<typeof meetingSummarySchema>;
