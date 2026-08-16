import { Router } from "express";
import { requireSession } from "../../middleware/auth.js";
import { queryMeetingHandler, querySessionHandler } from "./ai.controller.js";

export const aiRouter = Router();

aiRouter.post("/meetings/:id/query", requireSession, queryMeetingHandler);
aiRouter.post("/session/query", requireSession, querySessionHandler);
