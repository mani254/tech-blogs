import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@org/internal-sdk';

interface GuestRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

export function GuestRoute({
  redirectTo = '/dashboard',
  children,
}: GuestRouteProps) {
  const { isAuthenticated, isInitialized, isLoading, isAdmin } = useAdminAuth();

  if (!isInitialized || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
