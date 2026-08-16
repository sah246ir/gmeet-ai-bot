import { Worker } from 'bullmq';
import { connection } from '../connection.js';
import { prisma } from '../../lib/prisma.js';
import { groupTranscripts } from '../../lib/group-transcripts.js';
import { RagService } from '../../lib/rag.js';

interface MeetingJoinJobData {
  meetingId: string;
}

export const transcribeChunkerWorker = new Worker<MeetingJoinJobData>(
  'transcript-chunker',
  async (job) => {
    const { meetingId } = job.data;
    const meeting = await prisma.meeting.findUniqueOrThrow({
      where: { id: meetingId },
      select: { sessionToken: true },
    })
    const transcripts = await prisma.transcriptSegment.findMany({
      where:{
        meetingId
      }
    })
    const transcribe = groupTranscripts(transcripts, meetingId, meeting.sessionToken)
    await RagService.pineconeService.upsertChunk(transcribe)
  },
  { connection },
);

transcribeChunkerWorker.on('failed', async (job, err) => {
  if (!job) return;
  
});
