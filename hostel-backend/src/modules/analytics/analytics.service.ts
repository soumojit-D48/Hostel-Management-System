import { PrismaClient, IssueStatus, Role } from '@prisma/client';
import { startOfDay, subDays, startOfHour, format } from 'date-fns';

const prisma = new PrismaClient();

export class AnalyticsService {
    async getDashboardOverview(hostelId?: string, userId?: string, userRole?: string) {
        let whereClause: any = {};

        if (hostelId) {
            whereClause.hostelId = hostelId;
        }

        if (userRole === 'STUDENT' && userId) {
            whereClause.reportedById = userId;
        } else if (userRole === 'STAFF' && userId) {
            whereClause.assignedToId = userId;
        }

        
        const statusCounts = await prisma.issue.groupBy({
            by: ['status'],
            where: whereClause,
            _count: {
                id: true,
            },
        });

        
        const counts = {
            [IssueStatus.REPORTED]: 0,
            [IssueStatus.ASSIGNED]: 0,
            [IssueStatus.IN_PROGRESS]: 0,
            [IssueStatus.RESOLVED]: 0,
            [IssueStatus.CLOSED]: 0,
        };

        statusCounts.forEach((item) => {
            counts[item.status] = item._count.id;
        });

        
        const today = startOfDay(new Date());
        const newIssuesToday = await prisma.issue.count({
            where: {
                ...whereClause,
                createdAt: {
                    gte: today,
                },
            },
        });

        
        
        const resolvedIssues = await prisma.issue.findMany({
            where: {
                ...whereClause,
                status: {
                    in: [IssueStatus.RESOLVED, IssueStatus.CLOSED],
                },
                resolvedAt: {
                    not: null,
                },
            },
            select: {
                createdAt: true,
                resolvedAt: true,
                assignedAt: true,
            },
        });

        let totalResolutionTime = 0;
        let totalResponseTime = 0;
        let responseCount = 0;

        resolvedIssues.forEach((issue) => {
            if (issue.resolvedAt) {
                totalResolutionTime += issue.resolvedAt.getTime() - issue.createdAt.getTime();
            }
            if (issue.assignedAt) {
                totalResponseTime += issue.assignedAt.getTime() - issue.createdAt.getTime();
                responseCount++;
            }
        });

        const avgResolutionTimeHours = resolvedIssues.length
            ? totalResolutionTime / resolvedIssues.length / (1000 * 60 * 60)
            : 0;

        const avgResponseTimeHours = responseCount
            ? totalResponseTime / responseCount / (1000 * 60 * 60)
            : 0;

        
        const totalIssues = Object.values(counts).reduce((a, b) => a + b, 0);
        const resolvedCount = counts[IssueStatus.RESOLVED] + counts[IssueStatus.CLOSED];
        const resolutionRate = totalIssues ? (resolvedCount / totalIssues) * 100 : 0;

        
        const pendingAssignments = counts[IssueStatus.REPORTED];

        return {
            statusCounts: counts,
            newIssuesToday,
            avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 100) / 100,
            avgResponseTimeHours: Math.round(avgResponseTimeHours * 100) / 100,
            resolutionRate: Math.round(resolutionRate * 100) / 100,
            pendingAssignments,
            totalIssues,
        };
    }

    async getCategoryBreakdown(hostelId?: string) {
        const whereClause = hostelId ? { hostelId } : {};

        const categoryCounts = await prisma.issue.groupBy({
            by: ['category'],
            where: whereClause,
            _count: {
                id: true,
            },
        });

        const total = categoryCounts.reduce((acc, curr) => acc + curr._count.id, 0);

        return categoryCounts.map((item) => ({
            category: item.category,
            count: item._count.id,
            percentage: total ? Math.round((item._count.id / total) * 100) : 0,
        })).sort((a, b) => b.count - a.count);
    }

    async getHostelComparison() {
        const hostels = await prisma.hostel.findMany({
            include: {
                _count: {
                    select: { issues: true },
                },
            },
        });

        const comparisonData = await Promise.all(
            hostels.map(async (hostel) => {
                const resolvedCount = await prisma.issue.count({
                    where: {
                        hostelId: hostel.id,
                        status: { in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] },
                    },
                });

                
                const resolvedIssues = await prisma.issue.findMany({
                    where: {
                        hostelId: hostel.id,
                        status: { in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] },
                        resolvedAt: { not: null },
                    },
                    select: { createdAt: true, resolvedAt: true },
                });

                let totalTime = 0;
                resolvedIssues.forEach(issue => {
                    if (issue.resolvedAt) {
                        totalTime += issue.resolvedAt.getTime() - issue.createdAt.getTime();
                    }
                });

                const avgResolutionTime = resolvedIssues.length
                    ? totalTime / resolvedIssues.length / (1000 * 60 * 60)
                    : 0;

                return {
                    hostelId: hostel.id,
                    hostelName: hostel.name,
                    totalIssues: hostel._count.issues,
                    resolvedCount,
                    resolutionRate: hostel._count.issues
                        ? Math.round((resolvedCount / hostel._count.issues) * 100)
                        : 0,
                    avgResolutionTimeHours: Math.round(avgResolutionTime * 10) / 10,
                };
            })
        );

        return comparisonData;
    }

    async getIssueTrends(days: number = 7, hostelId?: string) {
        const startDate = subDays(new Date(), days);
        const where = {
            createdAt: { gte: startDate },
            ...(hostelId ? { hostelId } : {}),
        };

        const issues = await prisma.issue.findMany({
            where,
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        
        const groupedByDate: Record<string, number> = {};

        
        for (let i = 0; i < days; i++) {
            const date = subDays(new Date(), i);
            groupedByDate[format(date, 'yyyy-MM-dd')] = 0;
        }

        issues.forEach((issue) => {
            const dateKey = format(issue.createdAt, 'yyyy-MM-dd');
            groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + 1;
        });

        
        return Object.entries(groupedByDate)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    async getTopRooms(limit = 5, hostelId?: string) {
        const where = hostelId ? { hostelId } : {};

        const roomCounts = await prisma.issue.groupBy({
            by: ['roomNumber', 'hostelId'],
            where,
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: limit,
        });

        
        const result = await Promise.all(roomCounts.map(async (item) => {
            const hostel = await prisma.hostel.findUnique({
                where: { id: item.hostelId },
                select: { name: true }
            });

            return {
                roomNumber: item.roomNumber,
                hostelName: hostel?.name,
                count: item._count.id
            };
        }));

        return result;
    }

    async getPeakReportingHours(hostelId?: string) {
        const where = hostelId ? { hostelId } : {};

        
        
        
        const issues = await prisma.issue.findMany({
            where: {
                ...where,
                createdAt: {
                    gte: subDays(new Date(), 90) 
                }
            },
            select: { createdAt: true },
        });

        const hourCounts = new Array(24).fill(0);

        issues.forEach((issue) => {
            const hour = issue.createdAt.getHours();
            hourCounts[hour]++;
        });

        return hourCounts.map((count, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            count,
        }));
    }

    async getStaffPerformance(hostelId?: string) {
        
        const staffMembers = await prisma.user.findMany({
            where: {
                role: Role.STAFF,
                ...(hostelId ? { hostelId } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true
            }
        });

        const performanceData = await Promise.all(
            staffMembers.map(async (staff) => {
                const assignedCount = await prisma.issue.count({
                    where: { assignedToId: staff.id },
                });

                const resolvedCount = await prisma.issue.count({
                    where: {
                        assignedToId: staff.id,
                        status: { in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] },
                    },
                });

                
                const resolvedIssues = await prisma.issue.findMany({
                    where: {
                        assignedToId: staff.id,
                        status: { in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] },
                        resolvedAt: { not: null },
                    },
                    select: { assignedAt: true, resolvedAt: true },
                });

                let totalTime = 0;
                resolvedIssues.forEach(issue => {
                    if (issue.resolvedAt && issue.assignedAt) {
                        totalTime += issue.resolvedAt.getTime() - issue.assignedAt.getTime();
                    }
                });

                const avgResolutionTime = resolvedIssues.length
                    ? totalTime / resolvedIssues.length / (1000 * 60 * 60)
                    : 0;

                
                
                
                

                return {
                    staffId: staff.id,
                    name: staff.name,
                    avatar: staff.avatar,
                    assignedCount,
                    resolvedCount,
                    pendingCount: assignedCount - resolvedCount,
                    avgResolutionTimeHours: Math.round(avgResolutionTime * 10) / 10,
                    resolutionRate: assignedCount ? Math.round((resolvedCount / assignedCount) * 100) : 0,
                };
            })
        );

        return performanceData.sort((a, b) => b.resolvedCount - a.resolvedCount);
    }
}

export default new AnalyticsService();
