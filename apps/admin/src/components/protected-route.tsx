import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@org/internal-sdk';

interface ProtectedRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

export function ProtectedRoute({
  redirectTo = '/login',
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, isLoading, isAdmin } = useAdminAuth();

  if (!isInitialized || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-medium text-zinc-400">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated or authenticated account does not have admin role
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
