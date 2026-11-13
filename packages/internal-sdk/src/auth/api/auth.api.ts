import type {
  AuthMessageResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  SendOtpResponse,
  SendPhoneOtpRequest,
  SendPhoneOtpResponse,
  User,
  VerifyOtpRequest,
  VerifyOtpResponse,
  VerifyPhoneOtpRequest,
  VerifyPhoneOtpResponse,
} from '@org/shared';
import { getApiClient } from '../../http/api-client';

export const authApi = {
  sendOtp: async (req: SendOtpRequest): Promise<SendOtpResponse> => {
    return getApiClient().post('/auth/send-otp', req);
  },

  resendOtp: async (req: SendOtpRequest): Promise<SendOtpResponse> => {
    return getApiClient().post('/auth/resend-otp', req);
  },

  verifyOtp: async (req: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    return getApiClient().post('/auth/verify-otp', req);
  },

  register: async (req: RegisterRequest): Promise<AuthResponse> => {
    return getApiClient().post('/auth/register', req);
  },

  login: async (req: LoginRequest): Promise<AuthResponse> => {
    return getApiClient().post('/auth/login', req);
  },

  forgotPassword: async (
    req: ForgotPasswordRequest,
  ): Promise<AuthMessageResponse> => {
    return getApiClient().post('/auth/forgot-password', req);
  },

  sendPhoneOtp: async (
    req: SendPhoneOtpRequest,
  ): Promise<SendPhoneOtpResponse> => {
    return getApiClient().post('/auth/send-phone-otp', req);
  },

  verifyPhoneOtp: async (
    req: VerifyPhoneOtpRequest,
  ): Promise<VerifyPhoneOtpResponse> => {
    return getApiClient().post('/auth/verify-phone-otp', req);
  },

  getMe: async (): Promise<User> => {
    return getApiClient().get('/auth/me');
  },

  googleLogin: async (req: {
    idToken: string;
    name?: string;
    email?: string;
  }): Promise<AuthResponse> => {
    return getApiClient().post('/auth/google', req);
  },

  logout: async (): Promise<AuthMessageResponse> => {
    return getApiClient().post('/auth/logout');
  },
};
