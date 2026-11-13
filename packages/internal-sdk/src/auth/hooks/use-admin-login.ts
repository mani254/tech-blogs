import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, LoginRequest } from '@org/shared';
import { authApi } from '../api/auth.api';
import { useAuth } from './use-auth';

export function useAdminLogin() {
  const { setToken, clearToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authApi.login(credentials);

      if (response.user.role !== 'admin') {
        clearToken();
        queryClient.removeQueries({ queryKey: ['auth'] });
        throw new Error(
          `Access Denied: The account "${response.user.email}" does not have administrator privileges.`,
        );
      }

      return response;
    },
    onSuccess: (res) => {
      if (res.token) {
        setToken(res.token);
      }
      if (res.user) {
        queryClient.setQueryData(['auth', 'me'], res.user);
      }
    },
  });
}
