import { User } from '../types/auth.js';

export const SEED_USERS: User[] = [
  {
    id: 'user-admin-01',
    email: 'admin@magnific.com',
    password: 'admin123',
    name: 'Master Sound Director',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-member-02',
    email: 'user@magnific.com',
    password: 'user123',
    name: 'Alex Sound Creator',
    role: 'USER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    createdAt: '2026-01-15T00:00:00Z',
  },
];
