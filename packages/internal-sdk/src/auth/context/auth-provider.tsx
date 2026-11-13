'use client';

import * as React from 'react';
import { configureApiClient } from '../../http/api-client';
import { getEnvConfig } from '../../config/env.config';

export interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const AuthContext = React.createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
}

export function AuthProvider({ children, apiBaseUrl }: AuthProviderProps) {
  const targetApiBaseUrl = apiBaseUrl || getEnvConfig().apiBaseUrl;
  const [isInitialized, setIsInitialized] = React.useState(false);

  const [token, setTokenState] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  });

  const setToken = React.useCallback((newToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', newToken);
    }
    setTokenState(newToken);
  }, []);

  const clearToken = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    setTokenState(null);
  }, []);

  React.useEffect(() => {
    configureApiClient({
      baseUrl: targetApiBaseUrl,
      getToken: () =>
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null,
    });
    setIsInitialized(true);
  }, [targetApiBaseUrl]);

  // Handle global 401 unauthorized session expiry
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUnauthorized = () => {
      clearToken();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [clearToken]);

  const value = React.useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      isInitialized,
      setToken,
      clearToken,
    }),
    [token, isInitialized, setToken, clearToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
