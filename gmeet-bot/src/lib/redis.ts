import IORedis from 'ioredis';
import { ENV } from './ENV.js';

export const connection = new IORedis(ENV.redisUrl, {
  maxRetriesPerRequest: null,
});
