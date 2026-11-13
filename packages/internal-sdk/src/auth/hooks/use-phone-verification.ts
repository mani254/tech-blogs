import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SendPhoneOtpRequest,
  SendPhoneOtpResponse,
  VerifyPhoneOtpRequest,
  VerifyPhoneOtpResponse,
} from '@org/shared';
import { authApi } from '../api/auth.api';

export function useSendPhoneOtp() {
  return useMutation<SendPhoneOtpResponse, Error, SendPhoneOtpRequest>({
    mutationFn: (data) => authApi.sendPhoneOtp(data),
  });
}

export function useVerifyPhoneOtp() {
  const queryClient = useQueryClient();

  return useMutation<VerifyPhoneOtpResponse, Error, VerifyPhoneOtpRequest>({
    mutationFn: (data) => authApi.verifyPhoneOtp(data),
    onSuccess: () => {
      // Invalidate current user query to refresh phoneVerified status
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
