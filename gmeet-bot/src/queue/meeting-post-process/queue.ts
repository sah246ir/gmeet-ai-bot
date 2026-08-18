import { Queue } from "bullmq";
import { connection } from "../connection.js";
import type { MeetingPostProcessJobData } from "./types.js";

export const MEETING_POST_PROCESS_QUEUE = "meeting-post-process";

export const meetingPostProcessQueue = new Queue<MeetingPostProcessJobData>(
    MEETING_POST_PROCESS_QUEUE,
    { connection },
);

export function enqueueMeetingPostProcess(meetingId: string) {
    return meetingPostProcessQueue.add(
        "process",
        { meetingId },
        {
            jobId: meetingId,
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: { age: 60 * 60 * 24 },
            removeOnFail: { age: 60 * 60 * 24 * 7 },
        },
    );
}
