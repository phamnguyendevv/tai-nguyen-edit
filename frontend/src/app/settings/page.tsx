'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Download,
  Bookmark,
  Users,
  Briefcase,
  Key,
  Cpu,
  Boxes,
  ShieldCheck,
  Sliders,
  CreditCard,
  HelpCircle,
  Info,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomPlayer } from '@/components/BottomPlayer';
import { useAuth } from '@/lib/auth/auth-context';
import { useLanguage } from '@/lib/i18n/language-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Active navigation tab on the left sidebar
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'billing'>('profile');

  // Form states initialized with user data or defaults from reference screenshot
  const [name, setName] = useState('Pham Nguyen');
  const [username, setUsername] = useState('phamtrungnguyen2288');
  const [email, setEmail] = useState('phamtrungnguyen2288@gmail.com');
  const [newsletter, setNewsletter] = useState(true);

  // System preferences theme
  const [theme, setTheme] = useState<'Dark' | 'Light' | 'System'>('Dark');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Sync user info from auth context if available
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) {
        setEmail(user.email);
        setUsername(user.email.split('@')[0]);
      }
    }
  }, [user]);

  // Sync theme with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('magnific_theme') as 'Dark' | 'Light' | 'System') || 'Dark';
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: 'Dark' | 'Light' | 'System') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('magnific_theme', newTheme);
      let effectiveDark = true;
      if (newTheme === 'Light') {
        effectiveDark = false;
      } else if (newTheme === 'System') {
        effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (effectiveDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
    setIsThemeOpen(false);
  };

  const handleLanguageChange = (newLang: 'en' | 'vi') => {
    setLanguage(newLang);
    setIsLangOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col selection:bg-neutral-800">
      {/* Top Main Navigation Header */}
      <Header />

      {/* Main Settings Container */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col">
        {/* Breadcrumbs & Top Quick Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-800/80">
          {/* Breadcrumbs: Settings / Profile */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 font-medium">{t('settingsBreadcrumb')}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-semibold">{t('profile')}</span>
          </div>

          {/* Right Action: Pricing link and profile avatar */}
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              {t('pricing')}
            </Link>
            <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Left Sidebar Card + Right Content Card */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1 items-start">
          {/* Left Sidebar Card Container */}
          <aside className="w-full lg:w-64 shrink-0 bg-[#141414] border border-[#232323] rounded-2xl p-4.5">
            {/* Group 1: Account */}
            <div className="mb-6">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">
                {t('account')}
              </div>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'profile'
                      ? 'bg-[#222222] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t('profile')}</span>
                </button>

                <Link
                  href="/downloads"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('stockDownloads')}</span>
                </Link>

                <Link
                  href="/collections"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{t('stockCollections')}</span>
                </Link>

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <Users className="w-4 h-4" />
                  <span>{t('following')}</span>
                </button>
              </nav>
            </div>

            {/* Group 2: Organization */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">
                {t('organization')}
              </div>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <Users className="w-4 h-4" />
                  <span>{t('myTeam')}</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <Users className="w-4 h-4" />
                  <span>{t('people')}</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4" />
                    <span>{t('projects')}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/60">
                    Business
                  </span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <Key className="w-4 h-4" />
                  <span>{t('apiKeys')}</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4" />
                    <span>{t('mcp')}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-pink-950/80 text-pink-400 border border-pink-800/60">
                    New
                  </span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Boxes className="w-4 h-4" />
                    <span>{t('pluginsAndApps')}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-pink-950/80 text-pink-400 border border-pink-800/60">
                    New
                  </span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors text-left"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('securitySso')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'preferences'
                      ? 'bg-[#222222] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>{t('preferences')}</span>
                </button>

                <Link
                  href="/pricing"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t('planAndBilling')}</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Right Main Content Card Container */}
          <main className="flex-1 min-w-0 bg-[#141414] border border-[#232323] rounded-2xl p-6 sm:p-10 pb-16">
            <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">{t('profile')}</h1>

            {/* Avatar Section */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-neutral-400 mb-2.5">
                {t('avatar')}
              </label>
              <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                {t('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-md bg-[#161616] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>

            {/* Username Input */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                {t('username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full max-w-md bg-[#161616] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>

            {/* Email Display */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                {t('email')}
              </label>
              <div className="text-xs text-neutral-300 font-mono select-all">
                {email}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800/80 my-8" />

            {/* System preferences Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white mb-4">{t('systemPreferences')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                {/* Language Dropdown */}
                <div className="relative">
                  <label className="block text-xs text-neutral-400 mb-1.5">{t('language')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLangOpen(!isLangOpen);
                      setIsThemeOpen(false);
                    }}
                    className="w-full bg-[#161616] hover:bg-[#202020] border border-neutral-800 hover:border-neutral-700 text-white text-xs font-medium rounded-lg px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors focus:outline-none"
                  >
                    <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                        isLangOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isLangOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {[
                        { code: 'en' as const, label: 'English' },
                        { code: 'vi' as const, label: 'Tiếng Việt' },
                      ].map((langOption) => (
                        <button
                          key={langOption.code}
                          type="button"
                          onClick={() => handleLanguageChange(langOption.code)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            language === langOption.code
                              ? 'bg-[#2b2b2b] text-white font-semibold'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60 font-medium'
                          }`}
                        >
                          <span>{langOption.label}</span>
                          {language === langOption.code && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Theme Dropdown */}
                <div className="relative">
                  <label className="block text-xs text-neutral-400 mb-1.5">{t('theme')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsThemeOpen(!isThemeOpen);
                      setIsLangOpen(false);
                    }}
                    className="w-full bg-[#161616] hover:bg-[#202020] border border-neutral-800 hover:border-neutral-700 text-white text-xs font-medium rounded-lg px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors focus:outline-none"
                  >
                    <span>{theme === 'Dark' ? t('dark') : theme === 'Light' ? t('light') : t('system')}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                        isThemeOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isThemeOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {[
                        { key: 'Light' as const, label: t('light') },
                        { key: 'Dark' as const, label: t('dark') },
                        { key: 'System' as const, label: t('system') },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.key}
                          type="button"
                          onClick={() => handleThemeChange(themeOption.key)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            theme === themeOption.key
                              ? 'bg-[#2b2b2b] text-white font-semibold'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60 font-medium'
                          }`}
                        >
                          <span>{themeOption.label}</span>
                          {theme === themeOption.key && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800/80 my-8" />

            {/* Connected accounts Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white mb-1">{t('connectedAccounts')}</h2>
              <p className="text-xs text-neutral-400 mb-4">
                {t('connectedAccountsDesc')}
              </p>

              {/* Google Connected Row */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141414] border border-neutral-800/90 max-w-xl">
                <div className="flex items-center gap-3">
                  {/* Google SVG Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-white">Google</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-neutral-400">{t('connected')}</span>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        language === 'vi'
                          ? 'Tài khoản Google này đang được dùng để đăng nhập nên không thể ngắt kết nối trực tiếp.'
                          : "This Google account is required for login and can't be disconnected."
                      )
                    }
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    {t('disconnect')}
                  </button>
                </div>
              </div>

              {/* Notice text */}
              <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed max-w-xl">
                {t('googleNotice')}{' '}
                <button
                  type="button"
                  onClick={() => alert('Support email: support@magnific.com')}
                  className="text-blue-400 hover:underline"
                >
                  {t('contactUs')}
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800/80 my-8" />

            {/* Notifications Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white mb-3">{t('notifications')}</h2>

              <div className="flex items-center justify-between max-w-2xl">
                <div>
                  <div className="text-xs font-semibold text-white mb-0.5">{t('newsletter')}</div>
                  <div className="text-xs text-neutral-400">
                    {t('newsletterDesc')}
                  </div>
                </div>

                {/* Newsletter Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setNewsletter(!newsletter)}
                  aria-pressed={newsletter}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    newsletter ? 'bg-white' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow transition duration-200 ease-in-out ${
                      newsletter ? 'translate-x-4 bg-black' : 'translate-x-0 bg-neutral-400'
                    }`}
                  />
                </button>
              </div>

              {/* Data protection text */}
              <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed max-w-2xl">
                Magnific will process your data under the terms of the{' '}
                <span className="text-blue-400 hover:underline cursor-pointer">{t('privacyPolicy')}</span>.{' '}
                <span className="text-blue-400 hover:underline cursor-pointer font-medium">
                  {t('moreInformation')}
                </span>
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800/80 my-8" />

            {/* Sessions & devices Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-white">{t('sessionsAndDevices')}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300">
                  {t('devicesCount')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4">
                <span>{t('deviceLimitNotice')}</span>
                <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
              </div>

              {/* Devices Table */}
              <div className="w-full overflow-x-auto border border-neutral-800/80 rounded-xl bg-[#141414] p-3 max-w-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800/60 pb-2">
                      <th className="font-medium pb-2 text-[11px]">{t('os')}</th>
                      <th className="font-medium pb-2 text-[11px]">{t('browser')}</th>
                      <th className="font-medium pb-2 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <span>{t('location')}</span>
                          <Info className="w-3 h-3 text-neutral-500" />
                        </span>
                      </th>
                      <th className="font-medium pb-2 text-[11px]">{t('lastSession')}</th>
                      <th className="font-medium pb-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-neutral-300">
                      <td className="py-2.5 font-medium text-white">Windows 10</td>
                      <td className="py-2.5 text-neutral-400">Chrome 156</td>
                      <td className="py-2.5 text-neutral-400 font-mono text-[11px]">113.190.17.228</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {t('thisDevice')}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                          title="Terminate session"
                          onClick={() => alert(language === 'vi' ? 'Không thể đăng xuất phiên hiện tại.' : 'Cannot terminate current session.')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delete account button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  if (confirm(t('deleteAccountConfirm'))) {
                    alert(t('deleteAccountSubmitted'));
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#f87171] hover:bg-[#ef4444] text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {t('deleteAccount')}
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Bottom Audio Player bar */}
      <BottomPlayer />
    </div>
  );
}
