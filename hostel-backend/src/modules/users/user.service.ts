import { prisma } from '../../config/database';
import { Role } from '@prisma/client';

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
                    role: 'desc', // STAFF comes before MANAGEMENT alphabetically, so desc puts MANAGEMENT first
                },
                {
                    name: 'asc',
                },
            ],
        });

        // Transform the response to match frontend expectations
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

        // If available filter is true, sort by assigned issues count (ascending)
        if (available) {
            formattedStaff.sort((a, b) => a.assignedIssuesCount - b.assignedIssuesCount);
        }

        return formattedStaff;
    }
}

export const userService = new UserService();
