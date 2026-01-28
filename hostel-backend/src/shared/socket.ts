import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { config } from './config/config';
import { logger } from './services/logger.service';

let io: Server | null = null;

export const initSocketServer = async (httpServer: import('http').Server) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.SOCKET_CORS_ORIGIN,
            methods: ['GET', 'POST'],
        },
    });

    try {
        const pubClient = createClient({ url: config.REDIS_URL });
        const subClient = pubClient.duplicate();

        await pubClient.connect();
        await subClient.connect();

        io.adapter(createAdapter(pubClient, subClient));
        logger.info({ message: 'Socket.io Redis adapter connected' });
    } catch (error) {
        logger.warn({
            message: 'Redis adapter not available, using in-memory adapter for Socket.io',
            error: error instanceof Error ? { name: error.name, message: error.message } : error,
        });
    }

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization;
        if (!token) {
            next(new Error('Unauthorized'));
            return;
        }
        next();
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId as string | undefined;
        const hostelId = socket.handshake.query.hostelId as string | undefined;

        if (userId) {
            socket.join(`user:${userId}`);
        }
        if (hostelId) {
            socket.join(`hostel:${hostelId}`);
        }
        socket.join('public');

        socket.on('disconnect', () => { });
    });

    return io;
};

export const getSocketServer = () => io;

export const emitToUser = (userId: string, event: string, payload: any) => {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, payload);
};

export const emitToHostel = (hostelId: string, event: string, payload: any) => {
    if (!io) return;
    io.to(`hostel:${hostelId}`).emit(event, payload);
};

export const emitToAll = (event: string, payload: any) => {
    if (!io) return;
    io.to('public').emit(event, payload);
};


