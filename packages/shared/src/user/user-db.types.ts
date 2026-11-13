import type { UserRole } from './user.types.js';

export interface CreateUserInput {
  name: string;
  email: string;
  role?: UserRole;
  password?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  avatar?: string;
  status?: string;
  color?: string;
  provider?: 'credentials' | 'google' | 'both';
  providerId?: string;
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  isOnline?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  avatar?: string;
  status?: string;
  color?: string;
  provider?: 'credentials' | 'google' | 'both';
  providerId?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  isOnline?: boolean;
}
