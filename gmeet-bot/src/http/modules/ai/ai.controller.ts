import type { Request, Response } from "express";
import { meetingQuerySchema, meetingIdParamsSchema } from "./ai.schema.js";
import { queryMeeting } from "./ai.service.js";

export async function queryMeetingHandler(req: Request, res: Response) {
    const params = meetingIdParamsSchema.safeParse(req.params);

    if (!params.success) {
        return void res.status(400).json({ error: "invalid params" });
    }

    const body = meetingQuerySchema.safeParse(req.body);

    if (!body.success) {
        return void res.status(400).json({ error: "invalid body", details: body.error.flatten() });
    }

    const result = await queryMeeting(params.data.id, req.sessionToken!, body.data.question);

    if (!result) {
        return void res.status(404).json({ error: "not found" });
    }

    res.json(result);
}
