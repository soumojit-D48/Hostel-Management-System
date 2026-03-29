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
        io.adapter((nsp) => {
            return nsp;
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
        logger.info({
            message: 'Client connected',
            data: { socketId: socket.id, userId: socket.data.userId },
        });

        socket.on('disconnect', (reason) => {
            logger.info({
                message: 'Client disconnected',
                data: { socketId: socket.id, reason },
            });
        });

        socket.on('join_hostel', (hostelId: string) => {
            socket.join(`hostel_${hostelId}`);
            logger.info({ message: `Socket ${socket.id} joined hostel_${hostelId}` });
        });

        socket.on('leave_hostel', (hostelId: string) => {
            socket.leave(`hostel_${hostelId}`);
            logger.info({ message: `Socket ${socket.id} left hostel_${hostelId}` });
        });
    });

    return io;
};

export const getIO = (): Server | null => io;

export const emitToUser = (userId: string, event: string, data: any) => {
    if (!io) return;
    io.to(`user_${userId}`).emit(event, data);
};

export const emitToHostel = (hostelId: string, event: string, data: any) => {
    if (!io) return;
    io.to(`hostel_${hostelId}`).emit(event, data);
};

export const emitToAll = (event: string, data: any) => {
    if (!io) return;
    io.emit(event, data);
};
