'use client';

// HTTP & Errors
export * from './http/api-client';
export * from './http/api-error';

// Utilities
export * from './utils';

// Auth Context & API
export * from './auth/context/auth-provider';
export * from './auth/api/auth.api';

// Auth TanStack Query Hooks
export * from './auth/hooks/use-auth';
export * from './auth/hooks/use-current-user';
export * from './auth/hooks/use-login';
export * from './auth/hooks/use-register';
export * from './auth/hooks/use-send-otp';
export * from './auth/hooks/use-verify-otp';
export * from './auth/hooks/use-forgot-password';
export * from './auth/hooks/use-logout';
export * from './auth/hooks/use-google-login';
export * from './auth/hooks/use-phone-verification';
export * from './auth/hooks/use-admin-auth';
export * from './auth/hooks/use-admin-login';

// User API & TanStack Query Hooks
export * from './user/api/user.api';
export * from './user/hooks/use-users';

// Socket Context & Hooks
export * from './socket/socket-context';

// SDK Provider
export * from './providers/sdk-provider';

// Re-export @org/shared types for convenient consumption in apps
export type {
  User,
  AuthResponse,
  AuthMessageResponse,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  SendOtpResponse,
  SendPhoneOtpRequest,
  SendPhoneOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  VerifyPhoneOtpRequest,
  VerifyPhoneOtpResponse,
  ForgotPasswordRequest,
  OtpPurpose,
  UserSummary,
} from '@org/shared';
