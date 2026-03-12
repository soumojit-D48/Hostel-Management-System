'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHostelComparison } from '@/hooks/queries/use-analytics';

export function HostelComparisonChart() {
  const { data: comparison, isLoading } = useHostelComparison();

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
    );
  }

  if (!comparison || Object.keys(comparison).length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-neutral-500">
        No hostel comparison data available
      </div>
    );
  }

  // Transform data for chart
  // Assuming comparison is an object like: { "Hostel A": { total: 10, resolved: 5, pending: 5 }, ... }
  const chartData = Object.entries(comparison).map(([hostelName, data]: [string, any]) => ({
    name: hostelName,
    Total: data.total || 0,
    Resolved: data.resolved || 0,
    Pending: data.pending || 0,
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
        <Bar dataKey="Total" fill="#3b82f6" />
        <Bar dataKey="Resolved" fill="#10b981" />
        <Bar dataKey="Pending" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}