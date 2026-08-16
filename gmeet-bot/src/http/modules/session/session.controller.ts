import type { Request, Response } from "express";
import { createSession } from "./session.service.js";
import { extractBearerToken } from "../../middleware/auth.js";

export async function createSessionHandler(req: Request, res: Response) {
    const token = extractBearerToken(req);
    const session = await createSession(token);
    res.json(session);
}
