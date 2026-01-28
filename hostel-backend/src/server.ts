import app from './app';
import { config } from './shared/config/config';
import { logger } from './shared/services/logger.service';
import { connectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    try {
      await connectRedis();
    } catch (redisError) {
      logger.warn({
        message: 'Redis connection failed, continuing without cache',
        error: redisError instanceof Error ? {
          name: redisError.name,
          message: redisError.message,
        } : redisError,
      });
    }
    
    const server = app.listen(config.PORT, () => {
      logger.info({
        message: 'Server started successfully',
        server: {
          port: config.PORT,
          environment: config.NODE_ENV,
          pid: process.pid,
        },
        urls: {
          health: `${config.BACKEND_URL}/health`,
          api: `${config.BACKEND_URL}/api/v1`,
        },
      });
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info({ message: `Received ${signal}. Starting graceful shutdown...` });
      
      server.close(async () => {
        logger.info({ message: 'HTTP server closed' });
        await disconnectRedis();
        logger.info({ message: 'Graceful shutdown completed' });
        process.exit(0);
      });

      setTimeout(async () => {
        logger.error({ message: 'Could not close connections in time, forcefully shutting down' });
        await disconnectRedis();
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error({
        message: 'Uncaught Exception',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({
        message: 'Unhandled Rejection',
        error: {
          reason,
          promise,
        },
      });
      process.exit(1);
    });

  } catch (error) {
    logger.error({
      message: 'Failed to start server',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
    process.exit(1);
  }
};

startServer();