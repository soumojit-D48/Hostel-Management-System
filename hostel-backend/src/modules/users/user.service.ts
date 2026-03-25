import { prisma } from '../../config/database';
import { Role } from '@prisma/client';
import { UpdateProfileInput } from './user.validation';

interface GetStaffListParams {
    hostelId?: string;
    available?: boolean;
}

class UserService {
    /**
     * Get list of staff members for assignment
     * @param params - Filter parameters
     * @returns List of staff members with their details
     */
    async getStaffList(params: GetStaffListParams) {
        const { hostelId, available } = params;

        const staffMembers = await prisma.user.findMany({
            where: {
                role: {
                    in: [Role.STAFF, Role.MANAGEMENT],
                },
                ...(hostelId && { hostelId }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                hostel: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        assignedIssues: {
                            where: {
                                status: {
                                    in: ['ASSIGNED', 'IN_PROGRESS'],
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    role: 'desc',
                },
                {
                    name: 'asc',
                },
            ],
        });

        const formattedStaff = staffMembers.map((staff) => ({
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            phone: staff.phone,
            avatar: staff.avatar,
            hostel: staff.hostel,
            assignedIssuesCount: staff._count.assignedIssues,
        }));

        if (available) {
            formattedStaff.sort((a, b) => a.assignedIssuesCount - b.assignedIssuesCount);
        }

        return formattedStaff;
    }

    /**
     * Update user profile
     * @param userId - Current user ID
     * @param data - Profile data to update
     * @returns Updated user profile
     */
    async updateProfile(userId: string, data: UpdateProfileInput) {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new Error('User not found');
        }

        if (data.phone && data.phone !== existingUser.phone) {
            const phoneExists = await prisma.user.findUnique({
                where: { phone: data.phone },
            });
            if (phoneExists && phoneExists.id !== userId) {
                throw new Error('Phone number already in use');
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone,
                emergencyContact: data.emergencyContact,
                avatar: data.avatar,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emergencyContact: true,
                bloodGroup: true,
                avatar: true,
                role: true,
                rollNumber: true,
                roomNumber: true,
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
        });

        return updatedUser;
    }

    /**
     * Get user profile
     * @param userId - Current user ID
     * @returns User profile
     */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emergencyContact: true,
                bloodGroup: true,
                avatar: true,
                role: true,
                rollNumber: true,
                roomNumber: true,
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
                createdAt: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
}

export const userService = new UserService();
