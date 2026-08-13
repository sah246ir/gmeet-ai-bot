import { Queue } from 'bullmq';
import { connection } from '../connection.js';

export const transcribeChunkerQueue = new Queue('transcript-chunker', { connection });
