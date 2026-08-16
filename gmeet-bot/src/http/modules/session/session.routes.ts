import { Router } from "express";
import { createSessionHandler } from "./session.controller.js";

export const sessionRouter = Router();

sessionRouter.post("/session", createSessionHandler);
