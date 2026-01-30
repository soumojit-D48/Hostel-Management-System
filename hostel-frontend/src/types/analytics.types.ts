export interface DashboardAnalytics {
  statusCounts: Record<string, number>;
  newIssuesToday: number;
  avgResolutionTimeHours: number;
  avgResponseTimeHours: number;
  resolutionRate: number;
  pendingAssignments: number;
  totalIssues: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface StaffPerformance {
  staffId: string;
  name: string;
  assignedCount: number;
  resolvedCount: number;
  pendingCount: number;
  avgResolutionTimeHours: number;
  resolutionRate: number;
}