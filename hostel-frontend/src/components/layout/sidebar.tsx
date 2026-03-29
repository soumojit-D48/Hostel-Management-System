'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  AlertCircle,
  Megaphone,
  Package,
  BarChart3,
  Settings,
  User,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
    setShowLogoutConfirm(false);
  };

  return (
    <>
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

        {/* Logout Button */}
        <div className="p-4 pt-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-error-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-error-400 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

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

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Logout
              </h2>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-error-600 px-4 py-2.5 font-medium text-white hover:bg-error-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}