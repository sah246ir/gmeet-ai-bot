import cors from 'cors';
import express from 'express';
import { sessionRouter } from './modules/session/session.routes.js';
import { meetingRouter } from './modules/meeting/meeting.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(sessionRouter);
  app.use(meetingRouter);
  app.use(aiRouter);

  return app;
}
