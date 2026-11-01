export type Role = 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  provider?: string;
  status?: UserStatus;
  isPro?: boolean;
  downloadsCount?: number;
  todayDownloads?: number;
  createdAt: string;
}

export type SafeUser = Omit<User, 'password'>;

export interface AuthResponse {
  token: string;
  user: SafeUser;
}

export interface CreateUserDTO {
  email: string;
  password?: string;
  name: string;
  role?: Role;
  status?: UserStatus;
  isPro?: boolean;
  downloadsCount?: number;
  todayDownloads?: number;
  avatarUrl?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
  isPro?: boolean;
  downloadsCount?: number;
  todayDownloads?: number;
  avatarUrl?: string;
}
