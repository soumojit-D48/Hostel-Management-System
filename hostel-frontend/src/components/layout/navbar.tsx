'use client';

import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUnreadNotificationsCount } from '@/hooks/queries/use-notifications';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadNotificationsCount();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex-center transition-transform group-hover:scale-105">
            <span className="text-lg font-bold text-white">HE</span>
          </div>
          <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            HostelEase
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link
            href="/notifications"
            className={cn(
              'relative h-9 w-9 rounded-lg flex-center',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-all hover:scale-105 active:scale-95'
            )}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount && unreadCount.count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-600 text-[10px] font-bold text-white">
                {unreadCount.count > 9 ? '9+' : unreadCount.count}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <Link
            href="/profile"
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-all hover:scale-105 active:scale-95'
            )}
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-950 flex-center">
              <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            {user && (
              <span className="hidden text-sm font-medium md:block">
                {user.name}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}



// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '@/hooks/use-auth';
// import { useUnreadNotificationsCount } from '@/hooks/queries/use-notifications';
// import { useUnreadAnnouncementsCount } from '@/hooks/queries/use-announcements';

// export function Navbar() {
//   const pathname = usePathname();
//   const { user, logout, isManagement } = useAuth();
//   const { data: notifCount } = useUnreadNotificationsCount();
//   const { data: announcementCount } = useUnreadAnnouncementsCount();

//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard' },
//     { name: 'Issues', href: '/issues' },
//     { name: 'Announcements', href: '/announcements', badge: announcementCount?.count },
//     { name: 'Lost & Found', href: '/lost-found' },
//     ...(isManagement ? [{ name: 'Analytics', href: '/analytics' }] : []),
//   ];

//   const isActive = (href: string) => {
//     return pathname.startsWith(href);
//   };

//   if (!user) return null;

//   return (
//     <nav className="bg-white shadow">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           {/* Logo & Nav Links */}
//           <div className="flex">
//             <div className="flex-shrink-0 flex items-center">
//               <Link href="/dashboard" className="text-xl font-bold text-primary-600">
//                 HostelEase
//               </Link>
//             </div>
//             <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//               {navigation.map((item) => (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium relative ${
//                     isActive(item.href)
//                       ? 'border-primary-500 text-neutral-900'
//                       : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
//                   }`}
//                 >
//                   {item.name}
//                   {item.badge && item.badge > 0 && (
//                     <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-600 text-white">
//                       {item.badge}
//                     </span>
//                   )}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           {/* Right side */}
//           <div className="flex items-center gap-4">
//             {/* Notifications */}
//             <Link
//               href="/notifications"
//               className="relative p-2 text-neutral-500 hover:text-neutral-700"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//               </svg>
//               {notifCount && notifCount.count > 0 && (
//                 <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-error-600 text-white text-xs flex items-center justify-center">
//                   {notifCount.count > 9 ? '9+' : notifCount.count}
//                 </span>
//               )}
//             </Link>

//             {/* Profile Dropdown */}
//             <div className="relative group">
//               <button className="flex items-center gap-2 p-2">
//                 <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
//                   <span className="text-primary-700 text-sm font-semibold">
//                     {user.name.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//                 <span className="text-sm text-neutral-700 hidden md:block">
//                   {user.name}
//                 </span>
//               </button>

//               {/* Dropdown Menu */}
//               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
//                 <Link
//                   href="/profile"
//                   className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
//                 >
//                   Profile
//                 </Link>
//                 <Link
//                   href="/settings"
//                   className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
//                 >
//                   Settings
//                 </Link>
//                 <button
//                   onClick={() => logout()}
//                   className="block w-full text-left px-4 py-2 text-sm text-error-700 hover:bg-neutral-100"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

