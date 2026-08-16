import type { RequestHandler } from "express";
import { sessionService } from "../../services/session/session.js";

export const requireSession: RequestHandler = async (req, res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

    if (!token) {
        return void res.status(401).json({ error: "unauthorized" });
    }

    const session = await sessionService.validateSession(token);

    if (!session) {
        return void res.status(401).json({ error: "unauthorized" });
    }

    next();
}
