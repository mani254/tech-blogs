import type { User } from '../user/user.types.js';

export type OtpPurpose =
  'register' | 'forgot_password' | 'verify_email' | 'verify_phone';

export interface SendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface ResendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface SendOtpResponse {
  message: string;
  expiresInSeconds: number;
  email: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string;
  email: string;
  purpose: OtpPurpose;
}

export interface SendPhoneOtpRequest {
  phone: string;
}

export interface VerifyPhoneOtpRequest {
  phone: string;
  otp: string;
}

export interface SendPhoneOtpResponse {
  message: string;
  expiresInSeconds: number;
  phone: string;
}

export interface VerifyPhoneOtpResponse {
  verified: boolean;
  message: string;
  phone: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface AuthMessageResponse {
  message: string;
  success: boolean;
}

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export interface SmsProvider {
  sendSms(to: string, message: string): Promise<boolean>;
}

export interface VerifyOtpResult<T = unknown> {
  valid: boolean;
  record?: T;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'INVALID_CODE';
  remainingAttempts?: number;
}

export interface OtpCooldownResult {
  inCooldown: boolean;
  remainingSeconds: number;
}

export interface CreateOtpInput {
  target?: string;
  email?: string;
  targetType?: 'email' | 'phone';
  otp: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  maxAttempts?: number;
}

export interface VerifyOtpInput {
  target?: string;
  email?: string;
  otp: string;
  purpose: OtpPurpose;
}
