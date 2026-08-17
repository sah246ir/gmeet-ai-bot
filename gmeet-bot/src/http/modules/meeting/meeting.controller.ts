import type { Request, Response } from "express";
import { createMeetingSchema, meetingIdParamsSchema } from "./meeting.schema.js";
import {
    createMeeting,
    listMeetingsForSession,
    getOwnedMeetingOrNull,
    assertMeetingOwnership,
    getMeetingTranscripts,
    endMeeting,
} from "./meeting.service.js";

export async function createMeetingHandler(req: Request, res: Response) {
    const parsed = createMeetingSchema.safeParse(req.body);

    if (!parsed.success) {
        return void res.status(400).json({ error: "invalid body", details: parsed.error.flatten() });
    }

    const meeting = await createMeeting(req.sessionToken!, parsed.data.url);
    res.status(201).json(meeting);
}

export async function listMeetingsHandler(req: Request, res: Response) {
    const meetings = await listMeetingsForSession(req.sessionToken!);
    res.json(meetings);
}

export async function getMeetingHandler(req: Request, res: Response) {
    const params = meetingIdParamsSchema.safeParse(req.params);

    if (!params.success) {
        return void res.status(400).json({ error: "invalid params" });
    }

    const meeting = await getOwnedMeetingOrNull(params.data.id, req.sessionToken!);

    if (!meeting) {
        return void res.status(404).json({ error: "not found" });
    }

    res.json(meeting);
}

export async function getMeetingTranscriptsHandler(req: Request, res: Response) {
    const params = meetingIdParamsSchema.safeParse(req.params);

    if (!params.success) {
        return void res.status(400).json({ error: "invalid params" });
    }

    const owned = await assertMeetingOwnership(params.data.id, req.sessionToken!);

    if (!owned) {
        return void res.status(404).json({ error: "not found" });
    }

    const transcripts = await getMeetingTranscripts(params.data.id);
    res.json(transcripts);
}

export async function endMeetingHandler(req: Request, res: Response) {
    const params = meetingIdParamsSchema.safeParse(req.params);

    if (!params.success) {
        return void res.status(400).json({ error: "invalid params" });
    }

    const owned = await assertMeetingOwnership(params.data.id, req.sessionToken!);

    if (!owned) {
        return void res.status(404).json({ error: "not found" });
    }

    endMeeting(params.data.id);
    res.json({ status: "ok" });
}
