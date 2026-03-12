'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStaffPerformance } from '@/hooks/queries/use-analytics';

export function StaffPerformanceChart() {
  const { data: performance, isLoading } = useStaffPerformance();

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
    );
  }

  if (!performance || performance.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-neutral-500">
        No staff performance data available
      </div>
    );
  }

  // Format data for chart
  const chartData = performance.map(staff => ({
    name: staff.name.split(' ')[0], // First name only for better fit
    'Assigned': staff.assignedCount,
    'Resolved': staff.resolvedCount,
    'Pending': staff.pendingCount,
    'Resolution Rate': Math.round(staff.resolutionRate),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
        <XAxis 
          dataKey="name" 
          className="text-xs text-neutral-600 dark:text-neutral-400"
        />
        <YAxis className="text-xs text-neutral-600 dark:text-neutral-400" />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Bar dataKey="Assigned" fill="#3b82f6" />
        <Bar dataKey="Resolved" fill="#10b981" />
        <Bar dataKey="Pending" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}