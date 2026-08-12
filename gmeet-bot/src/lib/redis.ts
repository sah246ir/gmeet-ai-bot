import IORedis from 'ioredis';
import { ENV } from './ENV';

export const connection = new IORedis(ENV.redisUrl, {
  maxRetriesPerRequest: null,
});
