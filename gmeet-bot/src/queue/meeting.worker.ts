import { Worker } from 'bullmq';
import { connection } from './connection.js';
import { prisma } from '../lib/prisma.js';

interface MeetingJoinJobData {
  meetingId: string;
  jobId: string;
}

export const meetingWorker = new Worker<MeetingJoinJobData>(
  'meeting-join',
  async (job) => {
    const { jobId } = job.data;

    await prisma.job.update({ where: { id: jobId }, data: { status: 'RUNNING' } });

    // TODO: dispatch to the joinee worker to actually join the meeting.
    console.log('processing meeting join job', job.data);

    await prisma.job.update({ where: { id: jobId }, data: { status: 'COMPLETED' } });
  },
  { connection },
);

meetingWorker.on('failed', async (job, err) => {
  if (!job) return;
  await prisma.job.update({
    where: { id: job.data.jobId },
    data: { status: 'FAILED', error: err.message },
  });
});
