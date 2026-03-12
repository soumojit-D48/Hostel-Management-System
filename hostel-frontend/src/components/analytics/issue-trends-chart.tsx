'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIssueTrends } from '@/hooks/queries/use-analytics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIME_RANGES = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

export function IssueTrendsChart() {
  const [selectedRange, setSelectedRange] = useState(30);
  const { data: trends, isLoading } = useIssueTrends(selectedRange);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          {TIME_RANGES.map((range) => (
            <div key={range.days} className="skeleton h-8 w-20 rounded" />
          ))}
        </div>
        <div className="flex h-80 items-center justify-center">
          <div className="spinner h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-neutral-500">
        No data available
      </div>
    );
  }

  // Format dates for display
  const formattedData = trends.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {TIME_RANGES.map((range) => (
          <Button
            key={range.days}
            size="sm"
            variant={selectedRange === range.days ? 'default' : 'outline'}
            onClick={() => setSelectedRange(range.days)}
            className={cn(
              selectedRange === range.days && 'bg-primary-600 text-white'
            )}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
          <XAxis 
            dataKey="date" 
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
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Issues Reported"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}