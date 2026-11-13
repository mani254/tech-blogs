'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiError, useLogin } from '@org/internal-sdk';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input, PasswordInput, notify } from '@org/ui';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      notify.success('Signed in successfully', 'Welcome back to TechBlogs!');
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        notify.error('Login failed', err.message);
      } else {
        const fallback = 'An unexpected error occurred during sign-in.';
        setErrorMessage(fallback);
        notify.error('Login failed', fallback);
      }
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm border border-slate-200">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-bold text-slate-900">
          Sign In to TechBlogs
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Access your reading list, articles, and bookmarks
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {errorMessage && (
          <Alert variant="error">
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="developer@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Create one free
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
