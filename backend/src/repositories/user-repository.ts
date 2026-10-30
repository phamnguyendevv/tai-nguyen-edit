import { SEED_USERS } from '../data/users.js';
import { User, SafeUser } from '../types/auth.js';

const runtimeUsers: User[] = [...SEED_USERS];

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const user = runtimeUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    return user ? { ...user } : null;
  }

  static async findById(id: string): Promise<User | null> {
    const user = runtimeUsers.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  static toSafeUser(user: User): SafeUser {
    const { password, ...safe } = user;
    return safe;
  }

  static async createOrUpdateGoogleUser(data: {
    email: string;
    name?: string;
    avatarUrl?: string;
    googleId?: string;
  }): Promise<User> {
    const cleanEmail = data.email.toLowerCase().trim();
    let user = runtimeUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      if (data.name) user.name = data.name;
      if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
      user.provider = 'google';
      return { ...user };
    }

    const newUser: User = {
      id: `usr-google-${Date.now()}`,
      email: cleanEmail,
      password: '', // OAuth accounts do not store password
      name: data.name || cleanEmail.split('@')[0],
      role: 'USER',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    runtimeUsers.push(newUser);
    return { ...newUser };
  }

  static async getAllUsers(): Promise<SafeUser[]> {
    return runtimeUsers.map(this.toSafeUser);
  }
}
