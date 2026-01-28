import { Request, Response, NextFunction } from 'express';
import lostFoundService from './lost-found.service';
import {
    createLostFoundSchema,
    createClaimSchema,
    updateClaimSchema,
    getLostFoundItemsSchema,
    searchLostFoundSchema,
} from './lost-found.validation';
import { AuthenticatedRequest } from '../../shared/types';
import { Role } from '@prisma/client';

export class LostFoundController {
    async createLostFoundItem(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            
            const validatedData = createLostFoundSchema.parse(req.body);

            
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            
            const imageUrls: string[] = [];
            if (req.files && Array.isArray(req.files)) {
                
                
                if (req.body.images) {
                    try {
                        const images = JSON.parse(req.body.images);
                        imageUrls.push(...images);
                    } catch {
                        imageUrls.push(...(Array.isArray(req.body.images) ? req.body.images : [req.body.images]));
                    }
                }
            }

            
            const result = await lostFoundService.createLostFoundItem(
                validatedData,
                imageUrls,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Lost/Found item created successfully',
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors,
                });
                return;
            }

            next(error);
        }
    }

    async getLostFoundItems(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            
            const filters = getLostFoundItemsSchema.parse(req.query);

            
            const result = await lostFoundService.getLostFoundItems(filters);

            res.status(200).json({
                success: true,
                data: result.items,
                pagination: result.pagination,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: error.errors,
                });
                return;
            }

            next(error);
        }
    }

    async searchLostFoundItems(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            
            const searchData = searchLostFoundSchema.parse(req.query);

            
            const items = await lostFoundService.searchLostFoundItems(searchData);

            res.status(200).json({
                success: true,
                data: items,
                count: items.length,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid search parameters',
                    errors: error.errors,
                });
                return;
            }

            next(error);
        }
    }

    async getLostFoundItemById(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const item = await lostFoundService.getLostFoundItemById(id as string, userId as string);

            res.status(200).json({
                success: true,
                data: item,
            });
        } catch (error: any) {
            if (error.message === 'Item not found') {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }

            next(error);
        }
    }

    async claimItem(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = req.params.id as string;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            
            const claimData = createClaimSchema.parse({
                ...req.body,
                itemId: id,
            });

            const claim = await lostFoundService.claimItem(claimData, userId);

            res.status(201).json({
                success: true,
                message: 'Claim submitted successfully',
                data: claim,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors,
                });
                return;
            }

            if (
                error.message === 'Item not found' ||
                error.message === 'This item has already been claimed or returned' ||
                error.message === 'You already have a pending claim for this item'
            ) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }

            next(error);
        }
    }

    async updateClaimStatus(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params as { id: string };
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || userRole !== Role.MANAGEMENT) {
                res.status(403).json({
                    success: false,
                    message: 'Only management can approve or reject claims',
                });
                return;
            }

            
            const updateData = updateClaimSchema.parse(req.body);

            const result = await lostFoundService.updateClaimStatus(
                id,
                updateData,
                userId
            );

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    claim: result.claim,
                    ...(result.contactInfo && { contactInfo: result.contactInfo }),
                },
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors,
                });
                return;
            }

            if (
                error.message === 'Claim not found' ||
                error.message === 'This claim has already been processed'
            ) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }

            next(error);
        }
    }

    async markAsReturned(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = req.params.id as string;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || userRole !== Role.MANAGEMENT) {
                res.status(403).json({
                    success: false,
                    message: 'Only management can mark items as returned',
                });
                return;
            }

            const result = await lostFoundService.markAsReturned(id as string, userId as string);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.item,
            });
        } catch (error: any) {
            if (
                error.message === 'Item not found' ||
                error.message === 'Only claimed items can be marked as returned'
            ) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }

            next(error);
        }
    }

    async getPendingClaims(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userRole = req.user?.role;

            if (userRole !== Role.MANAGEMENT) {
                res.status(403).json({
                    success: false,
                    message: 'Only management can view pending claims',
                });
                return;
            }

            const claims = await lostFoundService.getPendingClaims();

            res.status(200).json({
                success: true,
                data: claims,
                count: claims.length,
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new LostFoundController();
