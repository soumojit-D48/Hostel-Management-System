import { Request, Response } from 'express';
import { userService } from './user.service';
import { AuthenticatedRequest } from '../../shared/types';
import { UpdateProfileInput } from './user.validation';

class UserController {
    /**
     * Get list of staff members for assignment
     * GET /api/users/staff
     */
    async getStaffList(req: Request, res: Response) {
        try {
            const { hostelId, available } = req.query;

            const staffList = await userService.getStaffList({
                hostelId: hostelId as string | undefined,
                available: available === 'true',
            });

            res.json({
                success: true,
                data: staffList,
            });
        } catch (error: any) {
            console.error('Error fetching staff list:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch staff list',
                    details: error.message,
                },
            });
        }
    }

    /**
     * Update user profile
     * PATCH /api/users/profile
     */
    async updateProfile(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: { message: 'Unauthorized' },
                });
                return;
            }

            const data: UpdateProfileInput = req.body;
            const updatedUser = await userService.updateProfile(req.user.id, data);

            res.json({
                success: true,
                data: updatedUser,
                message: 'Profile updated successfully',
            });
        } catch (error: any) {
            console.error('Error updating profile:', error);
            
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    error: { message: 'User not found' },
                });
                return;
            }

            if (error.message.includes('already in use')) {
                res.status(400).json({
                    success: false,
                    error: { message: error.message },
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update profile',
                    details: error.message,
                },
            });
        }
    }

    /**
     * Get current user profile
     * GET /api/users/profile
     */
    async getProfile(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: { message: 'Unauthorized' },
                });
                return;
            }

            const user = await userService.getProfile(req.user.id);

            res.json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch profile',
                    details: error.message,
                },
            });
        }
    }
}

export const userController = new UserController();
