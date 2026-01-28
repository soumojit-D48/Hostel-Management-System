import { Request, Response, NextFunction } from 'express';
import analyticsService from './analytics.service';
import { AuthenticatedRequest } from '../../shared/types';
import { Role } from '@prisma/client';

export class AnalyticsController {

    async getDashboardOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hostelId } = req.query;

            const data = await analyticsService.getDashboardOverview(
                hostelId as string
            );

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getCategoryBreakdown(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hostelId } = req.query;

            const data = await analyticsService.getCategoryBreakdown(
                hostelId as string
            );

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getHostelComparison(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await analyticsService.getHostelComparison();

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getIssueTrends(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { days, hostelId } = req.query;
            const numDays = days ? parseInt(days as string) : 7;

            const data = await analyticsService.getIssueTrends(
                numDays,
                hostelId as string
            );

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getTopRooms(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { limit, hostelId } = req.query;
            const limitNum = limit ? parseInt(limit as string) : 5;

            const data = await analyticsService.getTopRooms(
                limitNum,
                hostelId as string
            );

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getPeakReportingHours(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hostelId } = req.query;

            const data = await analyticsService.getPeakReportingHours(
                hostelId as string
            );

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getStaffPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hostelId } = req.query;

            const data = await analyticsService.getStaffPerformance(
                hostelId as string
            );

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AnalyticsController();
