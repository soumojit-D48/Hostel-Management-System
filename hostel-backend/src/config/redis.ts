import Redis from 'ioredis';
import { logger } from '../shared/services/logger.service';
import { config } from '../shared/config/config';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

redis.on('connect', () => {
  logger.info({ message: 'Redis connected successfully' });
});

redis.on('error', (error) => {
  logger.error({
    message: 'Redis connection error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
});

redis.on('close', () => {
  logger.info({ message: 'Redis connection closed' });
});

redis.on('reconnecting', () => {
  logger.info({ message: 'Redis reconnecting...' });
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
    logger.info({ message: 'Redis connection established' });
  } catch (error) {
    logger.error({
      message: 'Failed to connect to Redis',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.disconnect();
    logger.info({ message: 'Redis disconnected successfully' });
  } catch (error) {
    logger.error({
      message: 'Error disconnecting from Redis',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
  }
};