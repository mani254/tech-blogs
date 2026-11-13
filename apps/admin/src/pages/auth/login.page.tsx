import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError, useAdminLogin } from '@org/internal-sdk';
import { Alert, Button, Card, Input, PasswordInput } from '@org/ui';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthLayout } from '../../layout/auth-layout';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useAdminLogin();
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

  const onSubmit = (values: LoginFormValues) => {
    setErrorMessage(null);
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate('/dashboard');
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(
            err.message ||
              'Failed to sign in. Administrator privileges required.',
          );
        }
      },
    });
  };

  return (
    <AuthLayout>
      <Card
        title="Admin Sign In"
        description="Enter administrator credentials to access the console"
        className="w-full max-w-sm bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs text-zinc-900"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <Alert variant="error" title="Authentication Error">
              {errorMessage}
            </Alert>
          )}

          <Input
            label="Email address"
            placeholder="admin@example.com"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            className="rounded-lg text-[13px]"
            {...register('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            className="rounded-lg text-[13px]"
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 font-medium text-[13px]"
            isLoading={loginMutation.isPending}
          >
            Sign in as Admin
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
