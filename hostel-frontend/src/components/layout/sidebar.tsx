'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertCircle,
  Megaphone,
  Package,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: Array<'STUDENT' | 'STAFF' | 'MANAGEMENT'>;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Issues',
    href: '/issues',
    icon: AlertCircle,
  },
  {
    name: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    name: 'Lost & Found',
    href: '/lost-found',
    icon: Package,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    allowedRoles: ['MANAGEMENT'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  return (
    <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-white lg:flex dark:border-neutral-800 dark:bg-neutral-900">
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-950 dark:text-primary-400'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              )}
            >
              <Icon 
                className={cn(
                  'h-5 w-5', 
                  isActive && 'text-primary-600 dark:text-primary-400'
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-600">
              <span className="text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {user.name}
              </p>
              <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}