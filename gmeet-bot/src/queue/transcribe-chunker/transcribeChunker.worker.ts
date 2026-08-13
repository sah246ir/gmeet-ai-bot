import { Worker } from 'bullmq';
import { connection } from '../connection.js';
import { prisma } from '../../lib/prisma.js';

interface MeetingJoinJobData {
  meetingId: string;
}

export const transcribeChunkerWorker = new Worker<MeetingJoinJobData>(
  'transcript-chunker',
  async (job) => {
    const { meetingId } = job.data;
    const transcripts = await prisma.transcriptSegment.findMany({
      where:{
        meetingId
      }
    })
  },
  { connection },
);

transcribeChunkerWorker.on('failed', async (job, err) => {
  if (!job) return;
  
});
