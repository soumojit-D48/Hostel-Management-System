import { PrismaClient } from '@prisma/client';
import { emitToUser } from '../../shared/socket';

const prisma = new PrismaClient();

export class NotificationService {
    async createNotification(userId: string, type: string, title: string, message: string, link?: string) {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link: link || null,
                isRead: false,
            },
        });
        emitToUser(userId, 'notification', notification);
        return notification;
    }

    async getNotifications(
        userId: string,
        unreadOnly: boolean | undefined,
        type: string | undefined,
        page: number,
        limit: number
    ) {
        const where: any = { userId };
        if (typeof unreadOnly === 'boolean' && unreadOnly) {
            where.isRead = false;
        }
        if (type) {
            where.type = type;
        }

        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        };
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return updated;
    }

    async markAllAsRead(userId: string) {
        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        return { updatedCount: result.count };
    }

    async getUnreadCount(userId: string) {
        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    async archiveOldNotifications(days: number = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const result = await prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: cutoff,
                },
            },
        });

        return { deletedCount: result.count };
    }
}

export const notificationService = new NotificationService();


