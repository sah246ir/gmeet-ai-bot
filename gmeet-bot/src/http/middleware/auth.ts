import type { Request, RequestHandler } from "express";
import { validateSession } from "../modules/session/session.service.js";

export function extractBearerToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

export const requireSession: RequestHandler = async (req, res, next) => {
    const token = extractBearerToken(req);

    if (!token) {
        return void res.status(401).json({ error: "unauthorized" });
    }

    const session = await validateSession(token);

    if (!session) {
        return void res.status(401).json({ error: "unauthorized" });
    }

    req.sessionToken = session.token;
    next();
}
