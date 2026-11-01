import { SEED_USERS } from '../data/users.js';
import { User, SafeUser, CreateUserDTO, UpdateUserDTO } from '../types/auth.js';

let runtimeUsers: User[] = [...SEED_USERS];

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
      status: 'ACTIVE',
      isPro: false,
      createdAt: new Date().toISOString(),
    };

    runtimeUsers.push(newUser);
    return { ...newUser };
  }

  static async getAllUsers(): Promise<SafeUser[]> {
    return runtimeUsers.map(this.toSafeUser);
  }

  static async createUser(dto: CreateUserDTO): Promise<SafeUser> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const existing = runtimeUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`Email "${cleanEmail}" already exists`);
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      password: dto.password || 'password123',
      name: dto.name.trim() || cleanEmail.split('@')[0],
      role: dto.role || 'USER',
      status: dto.status || 'ACTIVE',
      isPro: !!dto.isPro,
      avatarUrl:
        dto.avatarUrl ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face`,
      createdAt: new Date().toISOString(),
    };

    runtimeUsers.unshift(newUser);
    return this.toSafeUser(newUser);
  }

  static async updateUser(id: string, dto: UpdateUserDTO): Promise<SafeUser | null> {
    const userIndex = runtimeUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    const target = runtimeUsers[userIndex];

    if (dto.email) {
      const cleanEmail = dto.email.toLowerCase().trim();
      const existing = runtimeUsers.find(
        (u) => u.id !== id && u.email.toLowerCase() === cleanEmail
      );
      if (existing) {
        throw new Error(`Email "${cleanEmail}" is already used by another account`);
      }
      target.email = cleanEmail;
    }

    if (dto.name !== undefined) target.name = dto.name.trim();
    if (dto.role !== undefined) target.role = dto.role;
    if (dto.status !== undefined) target.status = dto.status;
    if (dto.isPro !== undefined) target.isPro = dto.isPro;
    if (dto.password) target.password = dto.password;
    if (dto.avatarUrl) target.avatarUrl = dto.avatarUrl;

    return this.toSafeUser(target);
  }

  static async deleteUser(id: string): Promise<boolean> {
    // Prevent deletion of master admin
    if (id === 'user-admin-01') {
      throw new Error('Không thể xóa tài khoản Quản trị viên gốc (Root Admin)');
    }

    const initialLen = runtimeUsers.length;
    runtimeUsers = runtimeUsers.filter((u) => u.id !== id);
    return runtimeUsers.length < initialLen;
  }

  static async toggleStatus(id: string): Promise<SafeUser | null> {
    const user = runtimeUsers.find((u) => u.id === id);
    if (!user) return null;

    if (id === 'user-admin-01') {
      throw new Error('Không thể khóa tài khoản Quản trị viên gốc');
    }

    user.status = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    return this.toSafeUser(user);
  }

  static async togglePro(id: string): Promise<SafeUser | null> {
    const user = runtimeUsers.find((u) => u.id === id);
    if (!user) return null;

    user.isPro = !user.isPro;
    return this.toSafeUser(user);
  }
}
