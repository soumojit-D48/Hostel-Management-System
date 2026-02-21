'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'STUDENT' | 'STAFF' | 'MANAGEMENT' | ('STUDENT' | 'STAFF' | 'MANAGEMENT')[];
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role requirements
  if (requireRole && user) {
    const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    
    if (!allowedRoles.includes(user.role)) {
      router.push('/403');
      return null;
    }
  }

  return <>{children}</>;
}