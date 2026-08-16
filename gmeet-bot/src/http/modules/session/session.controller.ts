import type { Request, Response } from "express";
import { createSession } from "./session.service.js";

export async function createSessionHandler(_req: Request, res: Response) {
    const session = await createSession();
    res.json(session);
}
