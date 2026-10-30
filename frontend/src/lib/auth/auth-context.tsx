'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, Subscription } from '@/types/auth';
import { ApiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  subscription: Subscription | null;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPreset: (role: Role) => Promise<void>;
  loginWithGoogle: (data: { email: string; name?: string; avatarUrl?: string; googleId?: string }) => Promise<void>;
  logout: () => void;
  upgradeSubscription: (
    planId: '1m' | '3m' | '6m' | '1y',
    planName: string,
    durationMonths: number,
    price: number
  ) => void;
  cancelSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const TEST_ACCOUNTS = {
  ADMIN: {
    email: 'admin@magnific.com',
    password: 'admin123',
    name: 'Master Sound Director',
    role: 'ADMIN' as Role,
  },
  USER: {
    email: 'user@magnific.com',
    password: 'user123',
    name: 'Alex Sound Creator',
    role: 'USER' as Role,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Initialize from localStorage and verify with backend
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('sfx_auth_token');
      const storedUser = localStorage.getItem('sfx_auth_user');
      const storedSub = localStorage.getItem('sfx_subscription');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }

      if (storedSub) {
        const parsed: Subscription = JSON.parse(storedSub);
        if (new Date(parsed.expiresAt) > new Date()) {
          setSubscription(parsed);
        } else {
          localStorage.removeItem('sfx_subscription');
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached auth state:', e);
    } finally {
      setIsLoading(false);
    }

    // Verify session in background
    ApiClient.getMe().then((verifiedUser) => {
      if (verifiedUser) {
        setUser(verifiedUser);
        localStorage.setItem('sfx_auth_user', JSON.stringify(verifiedUser));
      }
    }).catch(() => {});
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await ApiClient.login(email, password);
      setToken(authData.token);
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPreset = useCallback(async (role: Role) => {
    const preset = TEST_ACCOUNTS[role];
    await login(preset.email, preset.password);
  }, [login]);

  const loginWithGoogle = useCallback(
    async (googleData: { email: string; name?: string; avatarUrl?: string; googleId?: string }) => {
      setIsLoading(true);
      try {
        const authData = await ApiClient.loginWithGoogle(googleData);
        setToken(authData.token);
        setUser(authData.user);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sfx_auth_token');
    localStorage.removeItem('sfx_auth_user');
  }, []);

  const upgradeSubscription = useCallback(
    (
      planId: '1m' | '3m' | '6m' | '1y',
      planName: string,
      durationMonths: number,
      price: number
    ) => {
      const started = new Date();
      const expires = new Date();
      expires.setMonth(expires.getMonth() + durationMonths);

      const sub: Subscription = {
        planId,
        planName,
        durationMonths,
        price,
        startedAt: started.toISOString(),
        expiresAt: expires.toISOString(),
        status: 'ACTIVE',
      };

      setSubscription(sub);
      localStorage.setItem('sfx_subscription', JSON.stringify(sub));
    },
    []
  );

  const cancelSubscription = useCallback(() => {
    setSubscription(null);
    localStorage.removeItem('sfx_subscription');
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;
  const isPro = isAdmin || (!!subscription && subscription.status === 'ACTIVE');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isAuthenticated,
        subscription,
        isPro,
        login,
        loginWithPreset,
        loginWithGoogle,
        logout,
        upgradeSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
