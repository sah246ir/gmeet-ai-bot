import { Router } from "express";
import { requireSession } from "../../middleware/auth.js";
import { queryMeetingHandler } from "./ai.controller.js";

export const aiRouter = Router();

aiRouter.post("/meetings/:id/query", requireSession, queryMeetingHandler);
