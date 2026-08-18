import { Router } from "express";
import { requireSession } from "../../middleware/auth.js";
import {
    createMeetingHandler,
    listMeetingsHandler,
    getMeetingHandler,
    getMeetingTranscriptsHandler,
    getMeetingInsightHandler,
    endMeetingHandler,
} from "./meeting.controller.js";

export const meetingRouter = Router();

meetingRouter.post("/meetings", requireSession, createMeetingHandler);
meetingRouter.get("/meetings", requireSession, listMeetingsHandler);
meetingRouter.get("/meetings/:id", requireSession, getMeetingHandler);
meetingRouter.get("/meetings/:id/transcripts", requireSession, getMeetingTranscriptsHandler);
meetingRouter.get("/meetings/:id/insights", requireSession, getMeetingInsightHandler);
meetingRouter.post("/meetings/:id/end", requireSession, endMeetingHandler);
