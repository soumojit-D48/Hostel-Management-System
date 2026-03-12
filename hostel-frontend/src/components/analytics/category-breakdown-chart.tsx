'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useCategoryBreakdown } from '@/hooks/queries/use-analytics';

const COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#6366f1', // indigo
    '#ec4899', // pink
];

export function CategoryBreakdownChart() {
    const { data: breakdown, isLoading } = useCategoryBreakdown();

    if (isLoading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="spinner h-8 w-8" />
            </div>
        );
    }

    if (!breakdown || breakdown.length === 0) {
        return (
            <div className="flex h-80 items-center justify-center text-sm text-neutral-500">
                No data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={320}>
            <PieChart>
                <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.payload.category}: ${props.payload.percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                >
                    {breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                        `${value} issues (${item.payload.percentage.toFixed(1)}%)`,
                        item.payload.category
                    ]}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}