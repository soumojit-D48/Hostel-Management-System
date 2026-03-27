import Redis from 'ioredis';
import { logger } from '../shared/services/logger.service';
import { config } from '../shared/config/config';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn({ message: 'Redis max retries reached, giving up' });
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  enableOfflineQueue: true,
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

redis.on('connect', () => {
  logger.info({ message: 'Redis connected successfully' });
});

redis.on('error', (error) => {
  logger.warn({
    message: 'Redis connection error (non-critical)',
    error: {
      name: error.name,
      message: error.message,
    },
  });
});

redis.on('close', () => {
  logger.info({ message: 'Redis connection closed' });
});

redis.on('reconnecting', () => {
  logger.info({ message: 'Redis reconnecting...' });
});

process.on('unhandledRejection', (reason) => {
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const err = reason as { message: string };
    if (err.message.includes('Socket closed unexpectedly') || err.message.includes('Connection is closed')) {
      logger.warn({ message: 'Redis connection issue (handled)' });
      return;
    }
  }
  console.error('Unhandled rejection:', reason);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
    logger.info({ message: 'Redis connection established' });
  } catch (error) {
    logger.warn({
      message: 'Redis connection failed, continuing without cache',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : error,
    });
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.disconnect();
    logger.info({ message: 'Redis disconnected successfully' });
  } catch (error) {
    logger.warn({
      message: 'Error disconnecting from Redis',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : error,
    });
  }
};
