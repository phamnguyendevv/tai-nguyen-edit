export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  provider?: string;
  createdAt: string;
}

export type SafeUser = Omit<User, 'password'>;

export interface AuthResponse {
  token: string;
  user: SafeUser;
}
