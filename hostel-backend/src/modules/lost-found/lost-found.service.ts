import { PrismaClient, LostFoundStatus, ClaimStatus } from '@prisma/client';
import {
    CreateLostFoundInput,
    CreateClaimInput,
    UpdateClaimInput,
    GetLostFoundItemsInput,
    SearchLostFoundInput,
} from './lost-found.validation';
import { notificationService } from '../notifications/notification.service';
import { emitToAll } from '../../shared/socket';

const prisma = new PrismaClient();

export class LostFoundService {
    private calculateSimilarity(str1: string, str2: string): number {
        const tokens1 = str1.toLowerCase().split(/\s+/);
        const tokens2 = str2.toLowerCase().split(/\s+/);

        const set1 = new Set(tokens1);
        const set2 = new Set(tokens2);

        const intersection = new Set([...set1].filter((x) => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    private async findPotentialMatches(
        itemName: string,
        description: string,
        oppositeStatus: LostFoundStatus
    ) {
        const items = await prisma.lostFound.findMany({
            where: {
                status: oppositeStatus,
                NOT: {
                    status: {
                        in: [LostFoundStatus.CLAIMED, LostFoundStatus.RETURNED],
                    },
                },
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                reportedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        const matches = items
            .map((item) => {
                const nameSimilarity = this.calculateSimilarity(itemName, item.itemName);
                const descSimilarity = this.calculateSimilarity(description, item.description);
                const overallSimilarity = nameSimilarity * 0.6 + descSimilarity * 0.4;

                return {
                    item,
                    similarity: overallSimilarity,
                };
            })
            .filter((match) => match.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);

        return matches.map((match) => ({
            ...match.item,
            matchScore: Math.round(match.similarity * 100),
        }));
    }

    async createLostFoundItem(
        itemData: CreateLostFoundInput,
        imageUrls: string[],
        userId: string
    ) {
        
        const item = await prisma.lostFound.create({
            data: {
                itemName: itemData.itemName,
                description: itemData.description,
                category: itemData.category,
                location: itemData.location,
                date: itemData.date,
                status: itemData.status,
                images: imageUrls,
                reportedById: userId,
            },
            include: {
                reportedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        hostel: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        block: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        
        const oppositeStatus =
            itemData.status === LostFoundStatus.LOST
                ? LostFoundStatus.FOUND
                : LostFoundStatus.LOST;

        const potentialMatches = await this.findPotentialMatches(
            itemData.itemName,
            itemData.description,
            oppositeStatus
        );

        emitToAll('lost_found_created', item);

        return {
            item,
            potentialMatches,
            message:
                potentialMatches.length > 0
                    ? `Found ${potentialMatches.length} potential match(es)`
                    : 'No potential matches found',
        };
    }

    async getLostFoundItems(filters: GetLostFoundItemsInput) {
        const { status, category, startDate, endDate, page, limit } = filters;

        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        const [items, total] = await Promise.all([
            prisma.lostFound.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    reportedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            hostel: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            block: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    claims: {
                        where: {
                            status: ClaimStatus.PENDING,
                        },
                        select: {
                            id: true,
                            status: true,
                        },
                    },
                },
            }),
            prisma.lostFound.count({ where }),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        };
    }

    async searchLostFoundItems(searchData: SearchLostFoundInput) {
        const { query, status, category } = searchData;

        const where: any = {
            OR: [
                { itemName: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                { location: { contains: query, mode: 'insensitive' } },
            ],
        };

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        const items = await prisma.lostFound.findMany({
            where,
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                reportedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return items;
    }

    async getLostFoundItemById(itemId: string, userId: string) {
        const item = await prisma.lostFound.findUnique({
            where: { id: itemId },
            include: {
                reportedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        hostel: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        block: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                claims: {
                    include: {
                        claimant: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!item) {
            throw new Error('Item not found');
        }

        return item;
    }

    async claimItem(claimData: CreateClaimInput, userId: string) {
        const { itemId, verificationDetails, proofImage } = claimData;

        
        const item = await prisma.lostFound.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            throw new Error('Item not found');
        }

        if (item.status === LostFoundStatus.CLAIMED || item.status === LostFoundStatus.RETURNED) {
            throw new Error('This item has already been claimed or returned');
        }

        
        const existingClaim = await prisma.lostFoundClaim.findFirst({
            where: {
                itemId,
                claimantId: userId,
                status: ClaimStatus.PENDING,
            },
        });

        if (existingClaim) {
            throw new Error('You already have a pending claim for this item');
        }

        
        const claim = await prisma.lostFoundClaim.create({
            data: {
                itemId,
                claimantId: userId,
                verificationDetails,
                proofImage: proofImage || null,
                status: ClaimStatus.PENDING,
            },
            include: {
                item: {
                    include: {
                        reportedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                claimant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        await notificationService.createNotification(
            item.reportedById,
            'lost_found_claim_created',
            'New claim on your item',
            'Someone has submitted a claim for your lost/found item.'
        );

        return claim;
    }

    async updateClaimStatus(
        claimId: string,
        updateData: UpdateClaimInput,
        managementUserId: string
    ) {
        const { action, remarks } = updateData;

        
        const claim = await prisma.lostFoundClaim.findUnique({
            where: { id: claimId },
            include: {
                item: {
                    include: {
                        reportedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                claimant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!claim) {
            throw new Error('Claim not found');
        }

        if (claim.status !== ClaimStatus.PENDING) {
            throw new Error('This claim has already been processed');
        }

        
        if (action === 'APPROVE') {
            const [updatedClaim] = await prisma.$transaction([
                prisma.lostFoundClaim.update({
                    where: { id: claimId },
                    data: {
                        status: ClaimStatus.APPROVED,
                        remarks: remarks || 'Claim approved by management',
                    },
                    include: {
                        item: true,
                        claimant: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                }),
                prisma.lostFound.update({
                    where: { id: claim.itemId },
                    data: {
                        status: LostFoundStatus.CLAIMED,
                    },
                }),
            ]);

            
            const maskPhone = (phone: string) => {
                if (phone.length <= 4) return phone;
                return phone.slice(0, 2) + '****' + phone.slice(-2);
            };

            await notificationService.createNotification(
                claim.claimantId,
                'lost_found_claim_approved',
                'Claim approved',
                'Your claim for the item has been approved.'
            );
            await notificationService.createNotification(
                claim.item.reportedBy.id,
                'lost_found_item_claimed',
                'Item claimed',
                'Your reported item has been claimed.'
            );

            return {
                claim: updatedClaim,
                contactInfo: {
                    reporter: {
                        name: claim.item.reportedBy.name,
                        email: claim.item.reportedBy.email,
                        phone: claim.item.reportedBy.phone,
                    },
                    claimant: {
                        name: claim.claimant.name,
                        email: claim.claimant.email,
                        phone: claim.claimant.phone,
                    },
                },
                message: 'Claim approved. Contact information has been shared with both parties.',
            };
        } else {
            
            const updatedClaim = await prisma.lostFoundClaim.update({
                where: { id: claimId },
                data: {
                    status: ClaimStatus.REJECTED,
                    remarks: remarks || 'Claim rejected by management',
                },
                include: {
                    item: true,
                    claimant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            await notificationService.createNotification(
                claim.claimantId,
                'lost_found_claim_rejected',
                'Claim rejected',
                'Your claim for the item has been rejected.'
            );

            return {
                claim: updatedClaim,
                message: 'Claim rejected.',
            };
        }
    }

    async markAsReturned(itemId: string, managementUserId: string) {
        const item = await prisma.lostFound.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            throw new Error('Item not found');
        }

        if (item.status !== LostFoundStatus.CLAIMED) {
            throw new Error('Only claimed items can be marked as returned');
        }

        const updatedItem = await prisma.lostFound.update({
            where: { id: itemId },
            data: {
                status: LostFoundStatus.RETURNED,
            },
            include: {
                reportedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return {
            item: updatedItem,
            message: 'Item marked as returned successfully',
        };
    }

    async getPendingClaims() {
        const claims = await prisma.lostFoundClaim.findMany({
            where: {
                status: ClaimStatus.PENDING,
            },
            include: {
                item: {
                    include: {
                        reportedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                claimant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return claims;
    }
}

export default new LostFoundService();
