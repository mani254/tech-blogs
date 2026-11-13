import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User, UserRole } from '@org/shared';
import { useAuth } from './use-auth';
import { useCurrentUser } from './use-current-user';

export interface UseAdminAuthResult {
  token: string | null;
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  hasAdminAccess: boolean;
  error: Error | null;
  logout: () => void;
}

export function useAdminAuth(): UseAdminAuthResult {
  const { token, isAuthenticated, isInitialized, clearToken } = useAuth();
  const { data: user, isLoading: isLoadingUser, error } = useCurrentUser();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';
  const role = user?.role ?? null;
  const isLoading = isAuthenticated && isLoadingUser;
  const hasAdminAccess = isAuthenticated && !isLoadingUser && isAdmin;

  const logout = React.useCallback(() => {
    clearToken();
    queryClient.removeQueries({ queryKey: ['auth'] });
  }, [clearToken, queryClient]);

  return {
    token,
    user: user ?? null,
    role,
    isAuthenticated,
    isAdmin,
    isInitialized,
    isLoading,
    hasAdminAccess,
    error: (error as Error) ?? null,
    logout,
  };
}
