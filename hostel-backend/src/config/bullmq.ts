import IORedis from 'ioredis';
import { config } from '../shared/config/config';

export const bullmqConnection = new IORedis(config.BULLMQ_REDIS_URL, {
  maxRetriesPerRequest: null,
});


