'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  trend 
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400',
    success: 'bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-950 dark:text-warning-400',
    info: 'bg-info-50 text-info-600 dark:bg-info-950 dark:text-info-400',
    error: 'bg-error-50 text-error-600 dark:bg-error-950 dark:text-error-400',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        {/* Left: Text Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            {value}
          </p>
          {trend && (
            <p className={cn(
              'mt-2 text-xs font-medium',
              trend.isPositive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>

        {/* Right: Icon */}
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          colorClasses[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}