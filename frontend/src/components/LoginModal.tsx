'use client';

import React, { useState } from 'react';
import { X, Shield, User, Lock, Mail, Loader2, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { useAuth, TEST_ACCOUNTS } from '@/lib/auth/auth-context';
import { useLanguage } from '@/lib/i18n/language-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, loginWithPreset, loginWithGoogle } = useAuth();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sign-In state
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [isCustomGoogleOpen, setIsCustomGoogleOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetLogin = async (role: 'ADMIN' | 'USER') => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithPreset(role);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Preset login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (account: {
    email: string;
    name: string;
    avatarUrl?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle(account);
      if (onSuccess) onSuccess();
      setIsGoogleChooserOpen(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const cleanEmail = customGoogleEmail.trim().toLowerCase();
    const cleanName = customGoogleName.trim() || cleanEmail.split('@')[0];
    await handleGoogleSignIn({
      email: cleanEmail,
      name: cleanName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=4285F4`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setIsGoogleChooserOpen(false);
          setIsCustomGoogleOpen(false);
          onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#131313] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 transition-all">
        {isGoogleChooserOpen ? (
          /* ================= Google Account Chooser View ================= */
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {/* Google Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white">{language === 'vi' ? 'Đăng nhập với Google' : 'Sign in with Google'}</h3>
                  <p className="text-[11px] text-neutral-400">{t('chooseAccount')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGoogleChooserOpen(false);
                  setIsCustomGoogleOpen(false);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 my-3">
                {error}
              </div>
            )}

            {/* List of Google Accounts */}
            <div className="mt-4 space-y-2">
              {/* Preset Google Account 1 */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleSignIn({
                    email: 'tainguyen.audio@gmail.com',
                    name: 'Tài Nguyên Sound',
                    avatarUrl:
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                  })
                }
                disabled={isLoading}
                className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800/90 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    alt="Tài Nguyên Sound"
                    className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-neutral-100">
                      Tài Nguyên Sound
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      tainguyen.audio@gmail.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Preset Google Account 2 */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleSignIn({
                    email: 'alex.creator@gmail.com',
                    name: 'Alex Nguyen',
                    avatarUrl:
                      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
                  })
                }
                disabled={isLoading}
                className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800/90 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80"
                    alt="Alex Nguyen"
                    className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-neutral-100">
                      Alex Nguyen
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      alex.creator@gmail.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Custom Google Account Option */}
              {!isCustomGoogleOpen ? (
                <button
                  type="button"
                  onClick={() => setIsCustomGoogleOpen(true)}
                  className="w-full p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-850 transition-all flex items-center gap-3 text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:text-white">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-neutral-200 group-hover:text-white">
                      Sử dụng một tài khoản Google khác
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Nhập địa chỉ Gmail của bạn
                    </div>
                  </div>
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="p-3 bg-neutral-900 border border-neutral-700 rounded-xl space-y-2.5">
                  <div className="text-[11px] font-semibold text-neutral-300">
                    Đăng nhập bằng Gmail của bạn:
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="ten-ban@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                  <input
                    type="text"
                    placeholder="Họ và tên hiển thị (tuỳ chọn)"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogleOpen(false)}
                      className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200"
                    >
                      {isLoading ? 'Đang xác thực...' : 'Tiếp tục'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Back button */}
            <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => {
                  setIsGoogleChooserOpen(false);
                  setIsCustomGoogleOpen(false);
                }}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('backToMethods')}</span>
              </button>
              <span className="text-[10px] text-neutral-400 font-mono">{language === 'vi' ? 'Bảo mật bởi Google' : 'Secured by Google'}</span>
            </div>
          </div>
        ) : (
          /* ================= Standard Sign-In View ================= */
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-white">{language === 'vi' ? 'Đăng Nhập Tài Khoản' : 'Account Sign In'}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{language === 'vi' ? 'Truy cập kho âm thanh chất lượng cao và tải về' : 'Access high quality sound effects and downloads'}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 mt-4">
                {error}
              </div>
            )}

            {/* Google Sign In Button (Top priority 1-click login) */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsGoogleChooserOpen(true)}
                disabled={isLoading}
                className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-400 hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 font-semibold text-xs text-white shadow-sm active:scale-98 group cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-neutral-100 group-hover:text-white font-medium">
                  {t('continueWithGoogle')}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-neutral-800" />
              <span className="absolute bg-[#131313] px-3 text-[10px] font-mono text-neutral-400 uppercase">
                {language === 'vi' ? 'hoặc tài khoản demo' : 'or demo account'}
              </span>
            </div>

            {/* 1-Click Fast Test Account Presets */}
            <div className="flex flex-col gap-2">
              {/* Admin Preset Button */}
              <button
                type="button"
                onClick={() => handlePresetLogin('ADMIN')}
                disabled={isLoading}
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-white hover:bg-neutral-800/80 transition-all flex items-center justify-between group text-left shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-neutral-100">
                        Admin Quản Trị
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white text-black">
                        ADMIN
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      admin@magnific.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Regular User Preset Button */}
              <button
                type="button"
                onClick={() => handlePresetLogin('USER')}
                disabled={isLoading}
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800/80 transition-all flex items-center justify-between group text-left shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neutral-800 text-white flex items-center justify-center font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-neutral-100">
                        User Thường
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-800 text-neutral-300">
                        USER
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      user@magnific.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-neutral-800" />
              <span className="absolute bg-[#131313] px-3 text-[10px] font-mono text-neutral-400 uppercase">
                hoặc email & mật khẩu
              </span>
            </div>

            {/* Manual Credentials Form */}
            <form onSubmit={handleManualSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@magnific.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : null}
                <span>Đăng Nhập</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
