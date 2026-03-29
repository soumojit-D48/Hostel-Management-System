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

/**
 * Controller class for Lost & Found endpoints
 */
export class LostFoundController {
    /**
     * Create a new lost or found item
     * POST /api/v1/lost-found
     */
    async createLostFoundItem(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            // Validate request body
            const validatedData = createLostFoundSchema.parse(req.body);

            // Extract user ID from authenticated request
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            // Process uploaded images
            const imageUrls: string[] = [];
            if (req.files && Array.isArray(req.files)) {
                // Images should be uploaded via upload middleware
                // URLs should be in req.body.images as JSON string or already processed
                if (req.body.images) {
                    try {
                        const images = JSON.parse(req.body.images);
                        imageUrls.push(...images);
                    } catch {
                        imageUrls.push(...(Array.isArray(req.body.images) ? req.body.images : [req.body.images]));
                    }
                }
            }

            // Create the item
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

    /**
     * Get lost & found items with filters and pagination
     * GET /api/v1/lost-found
     */
    async getLostFoundItems(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            // Validate query parameters
            const filters = getLostFoundItemsSchema.parse(req.query);

            // Get items
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

    /**
     * Search lost & found items
     * GET /api/v1/lost-found/search
     */
    async searchLostFoundItems(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            // Validate query parameters
            const searchData = searchLostFoundSchema.parse(req.query);

            // Search items
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

    /**
     * Get a single lost/found item by ID
     * GET /api/v1/lost-found/:id
     */
    async getLostFoundItemById(
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

    /**
     * Claim a lost/found item
     * POST /api/v1/lost-found/:id/claim
     */
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

            // Get verificationDetails from body
            const verificationDetails = req.body?.verificationDetails;
            
            // Handle uploaded proof image
            let proofImageUrl: string | undefined;
            if (req.files && Array.isArray(req.files)) {
                const proofFile = req.files.find((f: any) => f.fieldname === 'proofImage');
                if (proofFile) {
                    proofImageUrl = proofFile.path;
                }
            }

            // Build claim data
            const claimData = {
                itemId: id,
                verificationDetails: verificationDetails || '',
                proofImage: proofImageUrl,
            };

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

    /**
     * Update claim status (approve/reject) - Management only
     * PATCH /api/v1/lost-found/claims/:id
     */
    async updateClaimStatus(
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
                    message: 'Only management can approve or reject claims',
                });
                return;
            }

            // Validate update data
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

    /**
     * Mark item as returned - Management only
     * PATCH /api/v1/lost-found/:id/returned
     */
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

    /**
     * Get all pending claims - Management only
     * GET /api/v1/lost-found/claims/pending
     */
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

    /**
     * Report found item
     * POST /api/v1/lost-found/:id/found
     */
    async reportFoundItem(
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

            const foundMessage = req.body?.foundMessage;
            const foundLocation = req.body?.foundLocation;
            
            let foundImageUrl: string | undefined;
            if (req.files && Array.isArray(req.files)) {
                const foundFile = req.files.find((f: any) => f.fieldname === 'foundImage');
                if (foundFile) {
                    foundImageUrl = foundFile.path;
                }
            }

            const result = await lostFoundService.reportFoundItem(
                id,
                {
                    foundMessage: foundMessage || '',
                    foundLocation: foundLocation || '',
                    foundImage: foundImageUrl,
                },
                userId
            );

            res.status(200).json({
                success: true,
                data: result,
                message: 'Found item reported successfully. The owner has been notified.',
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
}

export default new LostFoundController();
