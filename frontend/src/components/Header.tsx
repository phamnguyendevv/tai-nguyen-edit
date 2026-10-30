'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  HelpCircle,
  Bookmark,
  Volume2,
  Shield,
  User,
  LogOut,
  ChevronDown,
  RefreshCw,
  Download,
  Crown,
  Sparkles,
  CreditCard,
  Settings,
  Globe,
  FolderHeart,
  Languages,
  Contrast,
  Power,
} from 'lucide-react';
import { useAudio } from '@/lib/audio/player-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useLanguage } from '@/lib/i18n/language-context';
import { LoginModal } from './LoginModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenFavorites?: () => void;
  onOpenCollections?: () => void;
  onOpenDownloads?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenFavorites,
  onOpenCollections,
  onOpenDownloads,
}) => {
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState('');

  // Keep search params in sync without breaking static generation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search);
    }
  }, [pathname]);

  const { favorites, downloads } = useAudio();
  const { user, isAdmin, isAuthenticated, isPro, subscription, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  type ThemeMode = 'Dark' | 'Light' | 'System';
  const [theme, setTheme] = useState<ThemeMode>('Dark');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const themeContainerRef = useRef<HTMLDivElement>(null);
  const languageContainerRef = useRef<HTMLDivElement>(null);

  // Load and apply theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('magnific_theme') as ThemeMode) || 'Dark';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (t: ThemeMode) => {
    if (typeof window === 'undefined') return;
    let effectiveDark = true;
    if (t === 'Light') {
      effectiveDark = false;
    } else if (t === 'System') {
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (effectiveDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('magnific_theme', newTheme);
      applyTheme(newTheme);
    }
    setIsThemeOpen(false);
  };

  const handleLanguageChange = (newLang: 'en' | 'vi') => {
    setLanguage(newLang);
    setIsLanguageOpen(false);
  };

  // Active status for the 5 navigation tabs
  const isMusicActive =
    pathname === '/music' || (pathname === '/' && currentSearch.includes('category=musical'));
  const isVoiceoverActive =
    pathname === '/voiceover' || (pathname === '/' && currentSearch.includes('category=voiceover'));
  const isPlaylistsActive = pathname === '/collections';
  const isDownloadsActive = pathname === '/downloads';
  const isSoundEffectsActive =
    pathname === '/' &&
    !currentSearch.includes('category=musical') &&
    !currentSearch.includes('category=voiceover');

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
        setIsThemeOpen(false);
        setIsLanguageOpen(false);
      } else {
        if (themeContainerRef.current && !themeContainerRef.current.contains(e.target as Node)) {
          setIsThemeOpen(false);
        }
        if (languageContainerRef.current && !languageContainerRef.current.contains(e.target as Node)) {
          setIsLanguageOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCollectionsClick = () => {
    setIsProfileOpen(false);
    if (onOpenCollections) {
      onOpenCollections();
    } else if (onOpenFavorites) {
      onOpenFavorites();
    }
  };

  const handleDownloadsClick = () => {
    setIsProfileOpen(false);
    if (onOpenDownloads) {
      onOpenDownloads();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1b1b1b]">
        <div className="relative max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-4 z-10">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden transition-colors"
              aria-label="Toggle Category Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-black text-sm tracking-tighter">
                <Volume2 className="w-4 h-4 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
                Magnific
              </span>
            </Link>
          </div>

          {/* Center: Navigation tabs (Centered across navbar) */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-7 text-sm font-medium z-0">
            {/* Music */}
            <Link
              href="/music"
              className={`cursor-pointer transition-colors py-1 relative select-none outline-none focus:outline-none focus-visible:outline-none ${
                isMusicActive
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{t('music')}</span>
              {isMusicActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full animate-in fade-in duration-150" />
              )}
            </Link>

            {/* Voiceover */}
            <Link
              href="/voiceover"
              className={`cursor-pointer transition-colors py-1 relative select-none outline-none focus:outline-none focus-visible:outline-none ${
                isVoiceoverActive
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{t('voiceover')}</span>
              {isVoiceoverActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full animate-in fade-in duration-150" />
              )}
            </Link>

            {/* Sound Effects */}
            <Link
              href="/"
              className={`cursor-pointer transition-colors py-1 relative select-none outline-none focus:outline-none focus-visible:outline-none ${
                isSoundEffectsActive
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{t('soundEffects')}</span>
              {isSoundEffectsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full animate-in fade-in duration-150" />
              )}
            </Link>

            {/* Playlists */}
            <Link
              href="/collections"
              className={`cursor-pointer transition-colors py-1 relative select-none outline-none focus:outline-none focus-visible:outline-none ${
                isPlaylistsActive
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{t('playlists')}</span>
              {isPlaylistsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full animate-in fade-in duration-150" />
              )}
            </Link>

            {/* Downloads */}
            <Link
              href="/downloads"
              className={`cursor-pointer transition-colors py-1 relative select-none outline-none focus:outline-none focus-visible:outline-none flex items-center gap-1.5 ${
                isDownloadsActive
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{t('downloads')}</span>
              {downloads.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-neutral-800 text-neutral-300 font-bold rounded-full">
                  {downloads.length}
                </span>
              )}
              {isDownloadsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full animate-in fade-in duration-150" />
              )}
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            {/* Admin Studio Portal link: ONLY visible to users with ADMIN role! */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold text-white bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Admin Management Studio"
              >
                <Shield className="w-3.5 h-3.5 text-neutral-300" />
                <span className="hidden sm:inline">{t('adminStudio')}</span>
                <span className="ml-0.5 px-1 sm:px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white text-black">
                  ADMIN
                </span>
              </Link>
            )}

            {/* Pro Pricing Plans Link */}
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-neutral-900 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title={t('proPlan')}
            >
              <Crown className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">{t('proPlan')}</span>
              {isPro && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-white text-black">
                  {t('vip')}
                </span>
              )}
            </Link>

            {/* Help button (hidden on extra small screens) */}
            <button
              type="button"
              className="hidden sm:flex p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={t('helpAndSupport')}
              aria-label="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile / Login Button */}
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500 transition-all shadow-sm"
              >
                {t('login')}
              </button>
            ) : (
              <div className="relative" ref={profileRef}>
                {/* Profile Avatar Button only (clean circular avatar, no text/role) */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 hover:border-neutral-400 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 focus:outline-none overflow-hidden"
                  aria-label="User Profile Menu"
                  title={user?.name || 'User Profile'}
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#121212] border border-[#242424] rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    {/* User profile header: Avatar + Name + Email */}
                    <div className="flex items-center gap-3 px-1 py-1 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-[13px] tracking-tight truncate">
                          {user?.name || 'Pham Nguyen'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {user?.email || 'phamtrungnguyen2288@gmail.com'}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: Upgrade & Create your team */}
                    <div className="flex flex-col gap-2 mb-3">
                      <Link
                        href="/pricing"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full py-2 px-3 rounded-lg bg-[#4f6ef7] hover:bg-[#4361ee] active:bg-[#3b52d4] text-white font-semibold text-xs text-center transition-colors shadow-sm flex items-center justify-center"
                      >
                        {t('upgrade')}
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          alert(t('teamComingSoon'));
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-[#181818] hover:bg-[#202020] border border-neutral-800 hover:border-neutral-700 text-white font-semibold text-xs text-center transition-colors"
                      >
                        {t('createTeam')}
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#222222] my-2" />

                    {/* Navigation Items */}
                    <div className="space-y-0.5">
                      {/* Plan & billing */}
                      <Link
                        href="/pricing"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                          <span className="text-xs font-medium">{t('planAndBilling')}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#1a233a] text-[#5c8aff] border border-[#26375c]">
                          {isPro ? t('pro') : t('free')}
                        </span>
                      </Link>

                      {/* Settings */}
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Settings className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                          <span className="text-xs font-medium">{t('settings')}</span>
                        </div>
                      </Link>

                      {/* Creator profile */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                          <span className="text-xs font-medium">{t('creatorProfile')}</span>
                        </div>
                      </button>

                      {/* My collections */}
                      <Link
                        href="/collections"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <FolderHeart className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                          <span className="text-xs font-medium">{t('myCollections')}</span>
                        </div>
                      </Link>

                      {/* Language */}
                      <div
                        ref={languageContainerRef}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-neutral-300 hover:bg-neutral-800/30 transition-colors relative"
                      >
                        <div className="flex items-center gap-3">
                          <Languages className="w-4 h-4 text-neutral-400" />
                          <span className="text-xs font-medium">{t('language')}</span>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLanguageOpen(!isLanguageOpen);
                              setIsThemeOpen(false);
                            }}
                            className="bg-[#161616] hover:bg-[#202020] border border-neutral-800 hover:border-neutral-700 text-white text-xs font-semibold rounded-md pl-3 pr-2.5 py-1 flex items-center gap-2 cursor-pointer transition-colors focus:outline-none min-w-[92px] justify-between"
                          >
                            <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${
                                isLanguageOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Language Custom Popover Dropdown */}
                          {isLanguageOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#181818] border border-[#2c2c2c] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                              {[
                                { code: 'en' as const, label: 'English' },
                                { code: 'vi' as const, label: 'Tiếng Việt' },
                              ].map((langOption) => {
                                const isSelected = language === langOption.code;
                                return (
                                  <button
                                    key={langOption.code}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLanguageChange(langOption.code);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                      isSelected
                                        ? 'bg-[#2b2b2b] text-white font-semibold'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60 font-medium'
                                    }`}
                                  >
                                    <span>{langOption.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Theme */}
                      <div
                        ref={themeContainerRef}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-neutral-300 hover:bg-neutral-800/30 transition-colors relative"
                      >
                        <div className="flex items-center gap-3">
                          <Contrast className="w-4 h-4 text-neutral-400" />
                          <span className="text-xs font-medium">{t('theme')}</span>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsThemeOpen(!isThemeOpen);
                              setIsLanguageOpen(false);
                            }}
                            className="bg-[#161616] hover:bg-[#202020] border border-neutral-800 hover:border-neutral-700 text-white text-xs font-semibold rounded-md pl-3 pr-2.5 py-1 flex items-center gap-2 cursor-pointer transition-colors focus:outline-none min-w-[92px] justify-between"
                          >
                            <span>{theme === 'Dark' ? t('dark') : theme === 'Light' ? t('light') : t('system')}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${
                                isThemeOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Theme Custom Popover Dropdown matching reference image */}
                          {isThemeOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#181818] border border-[#2c2c2c] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                              {[
                                { key: 'Light' as const, label: t('light') },
                                { key: 'Dark' as const, label: t('dark') },
                                { key: 'System' as const, label: t('system') },
                              ].map((themeOption) => {
                                const isSelected = theme === themeOption.key;
                                return (
                                  <button
                                    key={themeOption.key}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleThemeChange(themeOption.key);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                      isSelected
                                        ? 'bg-[#2b2b2b] text-white font-semibold'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60 font-medium'
                                    }`}
                                  >
                                    <span>{themeOption.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Studio Portal link if user is ADMIN */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-[#222222] my-2" />
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors text-xs font-medium"
                        >
                          <Shield className="w-4 h-4 text-neutral-400" />
                          <span>{t('adminStudio')}</span>
                        </Link>
                      </>
                    )}

                    {/* Divider */}
                    <div className="border-t border-[#222222] my-2" />

                    {/* Log out */}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-neutral-300 hover:text-red-400 hover:bg-red-950/20 transition-colors text-left group"
                    >
                      <Power className="w-4 h-4 text-neutral-400 group-hover:text-red-400 transition-colors" />
                      <span className="text-xs font-medium">{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login / Role Switching Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};
