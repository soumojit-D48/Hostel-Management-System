import { redis } from '../../config/redis';
import { logger } from './logger.service';

class CacheService {
  private isRedisAvailable = false;

  constructor() {
    this.checkRedisAvailability();
  }

  private checkRedisAvailability(): void {
    redis.on('connect', () => {
      this.isRedisAvailable = true;
    });
    redis.on('error', () => {
      this.isRedisAvailable = false;
    });
  }

  async get(key: string): Promise<string | null> {
    if (!this.isRedisAvailable) return null;
    
    try {
      const value = await redis.get(key);
      return value;
    } catch (error) {
      logger.error({
        message: 'Cache get error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        key,
      });
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error({
        message: 'Cache set error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        key,
      });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error({
        message: 'Cache delete error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        key,
      });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error({
        message: 'Cache exists error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        key,
      });
      return false;
    }
  }

  async addToBlacklist(token: string, ttl: number): Promise<boolean> {
    if (!this.isRedisAvailable) return true; // If Redis is down, assume token is valid for now
    
    const blacklistKey = `blacklist:${token}`;
    return this.set(blacklistKey, '1', ttl);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.isRedisAvailable) return false; // If Redis is down, don't block tokens
    
    const blacklistKey = `blacklist:${token}`;
    return this.exists(blacklistKey);
  }

  async getTTL(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error({
        message: 'Cache TTL error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        key,
      });
      return -1;
    }
  }

  async setWithTimestamp(key: string, value: string, ttl?: number): Promise<boolean> {
    const timestampedValue = JSON.stringify({
      value,
      timestamp: Date.now(),
    });
    return this.set(key, timestampedValue, ttl);
  }

  async getWithTimestamp(key: string): Promise<{ value: string; timestamp: number } | null> {
    const data = await this.get(key);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return parsed;
    } catch (error) {
      logger.error({
        message: 'Failed to parse timestamped cache value',
        error,
        key,
      });
      return null;
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error({
        message: 'Cache increment error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        key,
      });
      return 0;
    }
  }

  async incrementWithExpiry(key: string, ttl: number): Promise<number> {
    try {
      const value = await redis.incr(key);
      if (value === 1) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error({
        message: 'Cache increment with expiry error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        key,
      });
      return 0;
    }
  }
}

export const cacheService = new CacheService();