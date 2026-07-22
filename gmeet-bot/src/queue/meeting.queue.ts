import { Queue } from 'bullmq';
import { connection } from './connection.js';

export const meetingQueue = new Queue('meeting-join', { connection });
