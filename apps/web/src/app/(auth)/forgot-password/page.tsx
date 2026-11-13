'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input, OtpInput, PasswordInput, notify } from '@org/ui';
import {
  useSendOtp,
  useVerifyOtp,
  useForgotPassword,
  useResendOtp,
  ApiError,
} from '@org/internal-sdk';

const step1Schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

const step3Schema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step3Values = z.infer<typeof step3Schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [resendTimer, setResendTimer] = React.useState(0);

  const sendOtpMutation = useSendOtp();
  const resendOtpMutation = useResendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const forgotPasswordMutation = useForgotPassword();

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: '' },
  });

  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onStep1Submit = async (values: Step1Values) => {
    setGeneralError(null);
    try {
      await sendOtpMutation.mutateAsync({ email: values.email, purpose: 'forgot_password' });
      setEmail(values.email);
      setStep(2);
      setResendTimer(60);
      notify.success('Password reset code sent', `Check ${values.email} for your 6-digit OTP.`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send reset code.';
      setGeneralError(msg);
      notify.error('Reset Failed', msg);
    }
  };

  const handleVerifyOtp = async (codeToVerify: string) => {
    setOtpError(null);
    setGeneralError(null);
    try {
      await verifyOtpMutation.mutateAsync({ email, otp: codeToVerify, purpose: 'forgot_password' });
      setStep(3);
      notify.success('Code verified', 'Please enter your new password.');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Invalid or expired OTP code.';
      setOtpError(msg);
      notify.error('Verification failed', msg);
    }
  };

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (newOtp.length === 6) {
      handleVerifyOtp(newOtp);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setGeneralError(null);
    setOtpError(null);
    try {
      await resendOtpMutation.mutateAsync({ email, purpose: 'forgot_password' });
      setResendTimer(60);
      notify.info('Code resent', 'A new verification code has been dispatched.');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to resend code.';
      setGeneralError(msg);
      notify.error('Resend failed', msg);
    }
  };

  const onStep3Submit = async (values: Step3Values) => {
    setGeneralError(null);
    try {
      await forgotPasswordMutation.mutateAsync({
        email,
        otp,
        newPassword: values.newPassword,
      });
      notify.success('Password updated', 'Your password has been changed. Please sign in.');
      router.push('/login');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to reset password.';
      setGeneralError(msg);
      notify.error('Reset failed', msg);
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm border border-slate-200">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-bold text-slate-900">
          {step === 1 && 'Reset Your Password'}
          {step === 2 && 'Verify Code'}
          {step === 3 && 'Choose New Password'}
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          {step === 1 && 'Enter your email to receive a password reset code'}
          {step === 2 && `Enter the 6-digit code sent to ${email}`}
          {step === 3 && 'Choose a strong password for your TechBlogs account'}
        </p>

        <div className="flex items-center justify-center gap-2 pt-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-indigo-600'
                  : s < step
                    ? 'w-4 bg-indigo-300'
                    : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {generalError && (
          <Alert variant="error">
            {generalError}
          </Alert>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              placeholder="developer@example.com"
              error={step1Form.formState.errors.email?.message}
              {...step1Form.register('email')}
            />
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={sendOtpMutation.isPending}
            >
              {sendOtpMutation.isPending ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5 flex flex-col items-center">
            {otpError && (
              <Alert variant="error" className="w-full">
                {otpError}
              </Alert>
            )}

            <OtpInput
              length={6}
              value={otp}
              onChange={handleOtpChange}
              disabled={verifyOtpMutation.isPending}
            />

            <div className="text-xs text-slate-500 text-center space-y-1">
              <p>Didn&apos;t receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || resendOtpMutation.isPending}
                className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep(1);
                setOtp('');
                setOtpError(null);
              }}
              className="text-xs text-slate-500"
            >
              ← Use a different email
            </Button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-4">
            <PasswordInput
              label="New Password"
              placeholder="At least 6 characters"
              error={step3Form.formState.errors.newPassword?.message}
              {...step3Form.register('newPassword')}
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              error={step3Form.formState.errors.confirmPassword?.message}
              {...step3Form.register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-500">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
