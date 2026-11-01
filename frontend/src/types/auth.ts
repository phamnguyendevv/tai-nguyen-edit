export type Role = 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface Subscription {
  planId: '1m' | '3m' | '6m' | '1y';
  planName: string;
  durationMonths: number;
  price: number;
  startedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  provider?: string;
  status?: UserStatus;
  isPro?: boolean;
  createdAt?: string;
  subscription?: Subscription | null;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
  isPro?: boolean;
  avatarUrl?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
  isPro?: boolean;
  avatarUrl?: string;
}
