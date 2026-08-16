import crypto from "node:crypto";
import { prisma } from "../../../lib/prisma.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 2;

export async function createSession(existingToken?: string) {
    if (existingToken) {
        const existing = await validateSession(existingToken);
        if (existing) {
            return { token: existing.token, expiresAt: existing.expiresAt };
        }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await prisma.session.create({
        data: { token, expiresAt },
    });

    return { token, expiresAt };
}

export async function validateSession(token: string) {
    const session = await prisma.session.findUnique({ where: { token } });

    if (!session || session.expiresAt < new Date()) {
        return null;
    }

    return session;
}
