import { FilterParams, PaginatedSoundEffectsResponse, Category, SoundEffect } from '@/types/sfx';
import { AuthResponse, User, CreateUserData, UpdateUserData } from '@/types/auth';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export class ApiClient {
  private static getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('sfx_auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Login user with email and password
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed. Please check your credentials.');
    }

    const data: AuthResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('sfx_auth_token', data.token);
      localStorage.setItem('sfx_auth_user', JSON.stringify(data.user));
    }
    return data;
  }

  /**
   * Login user with Google OAuth
   */
  static async loginWithGoogle(data: {
    email: string;
    name?: string;
    avatarUrl?: string;
    googleId?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Google login failed. Please try again.');
    }

    const authData: AuthResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('sfx_auth_token', authData.token);
      localStorage.setItem('sfx_auth_user', JSON.stringify(authData.user));
    }
    return authData;
  }

  /**
   * Verify session / get current user
   */
  static async getMe(): Promise<User | null> {
    const authHeaders = this.getAuthHeader();
    if (!authHeaders.Authorization) return null;

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/auth/me`, {
        headers: { ...authHeaders },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  }

  /**
   * Fetch paginated and filtered sound effects from Backend API
   */
  static async getSoundEffects(
    params: FilterParams = {}
  ): Promise<PaginatedSoundEffectsResponse> {
    const url = new URL('/api/sound-effects', BACKEND_BASE_URL);
    if (params.q) url.searchParams.set('q', params.q);
    if (params.category) url.searchParams.set('category', params.category);
    if (params.subcategory) url.searchParams.set('subcategory', params.subcategory);
    if (params.sort) url.searchParams.set('sort', params.sort);
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.limit) url.searchParams.set('limit', params.limit.toString());

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
      return await res.json();
    } catch (error) {
      console.warn('Backend server not directly reachable, falling back to Next.js internal API route', error);
      const fallbackUrl = new URL('/api/sound-effects', window.location.origin);
      if (params.q) fallbackUrl.searchParams.set('q', params.q);
      if (params.category) fallbackUrl.searchParams.set('category', params.category);
      if (params.subcategory) fallbackUrl.searchParams.set('subcategory', params.subcategory);
      if (params.sort) fallbackUrl.searchParams.set('sort', params.sort);
      if (params.page) fallbackUrl.searchParams.set('page', params.page.toString());
      if (params.limit) fallbackUrl.searchParams.set('limit', params.limit.toString());

      const res = await fetch(fallbackUrl.toString());
      return await res.json();
    }
  }

  /**
   * Fetch category list from Backend API
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) return await res.json();
      const backendRes = await fetch(`${BACKEND_BASE_URL}/api/categories`);
      if (backendRes.ok) return await backendRes.json();
      return [];
    } catch {
      try {
        const res = await fetch('/api/categories');
        return await res.json();
      } catch {
        return [];
      }
    }
  }

  /**
   * Category and Subcategory Management (Admin only)
   */
  static async createCategory(category: { name: string; slug: string }): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-category', category }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create category');
    }
    return await res.json();
  }

  static async updateCategory(id: string, updates: { name: string; slug: string }): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-category', id, updates }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update category');
    }
    return await res.json();
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-category', id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete category');
    }
    return true;
  }

  static async createSubcategory(
    categoryId: string,
    subcategory: { name: string; slug: string }
  ): Promise<any> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-subcategory', categoryId, subcategory }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create subcategory');
    }
    return await res.json();
  }

  static async updateSubcategory(
    categoryId: string,
    subId: string,
    updates: { name: string; slug: string }
  ): Promise<any> {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-subcategory', categoryId, subId, updates }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update subcategory');
    }
    return await res.json();
  }

  static async deleteSubcategory(categoryId: string, subId: string): Promise<boolean> {
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-subcategory', categoryId, subId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete subcategory');
    }
    return true;
  }

  /**
   * Notify backend of audio download
   */
  static async recordDownload(id: string): Promise<any> {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/sound-effects/${id}/download`, {
        method: 'POST',
      });
      return await res.json();
    } catch {
      const res = await fetch(`/api/sound-effects/${id}/download`, { method: 'POST' });
      return await res.json();
    }
  }

  /**
   * Create a new sound effect (Admin only)
   */
  static async createSoundEffect(payload: any): Promise<SoundEffect> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/sound-effects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to upload sound effect: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Delete a sound effect (Admin only)
   */
  static async deleteSoundEffect(id: string): Promise<boolean> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/sound-effects/${id}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeader(),
      },
    });
    return res.ok;
  }

  /**
   * Get all users (Admin only)
   */
  static async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch users: ${res.statusText}`);
    }

    const data = await res.json();
    return data.users || [];
  }

  /**
   * Create user (Admin only)
   */
  static async createAdminUser(data: CreateUserData): Promise<User> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create user');
    }

    const json = await res.json();
    return json.user;
  }

  /**
   * Update user (Admin only)
   */
  static async updateAdminUser(id: string, data: UpdateUserData): Promise<User> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update user');
    }

    const json = await res.json();
    return json.user;
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteAdminUser(id: string): Promise<boolean> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete user');
    }

    return true;
  }

  /**
   * Toggle user status (ACTIVE / BANNED)
   */
  static async toggleUserStatus(id: string): Promise<User> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to toggle user status');
    }

    const json = await res.json();
    return json.user;
  }

  /**
   * Toggle user Pro membership
   */
  static async toggleUserPro(id: string): Promise<User> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${id}/toggle-pro`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to toggle user Pro status');
    }

    const json = await res.json();
    return json.user;
  }
}
