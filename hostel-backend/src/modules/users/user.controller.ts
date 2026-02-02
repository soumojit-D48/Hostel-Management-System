import { Request, Response } from 'express';
import { userService } from './user.service';

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
}

export const userController = new UserController();
