import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { transcribeChunkerQueue } from '../queue/transcribe-chunker/transcribeChunker.queue.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.post('/meetings', async (req, res) => {
  const { url } = req.body ?? {};

  if (typeof url !== 'string' || url.length === 0) {
    return res.status(400).json({ error: 'url is required' });
  }


});

router.get('/meetings/:id', async (req, res) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: req.params.id },
    include: { jobs: true },
  });

  if (!meeting) {
    return res.status(404).json({ error: 'not found' });
  }

  res.json(meeting);
});
