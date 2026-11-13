export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  phone?: string;
  phoneVerified?: boolean;
  color?: string;
  provider: 'credentials' | 'google' | 'both';
  emailVerified: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserResponse = User;

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string;
  color?: string;
  isOnline?: boolean;
}
