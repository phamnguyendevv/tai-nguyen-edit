'use client';

import React from 'react';
import {
  Activity,
  Users,
  Eye,
  Play,
  Download,
  CreditCard,
  HardDrive,
  Cpu,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  FolderTree,
  UploadCloud,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import { SoundEffect, Category } from '@/types/sfx';

interface AdminDashboardOverviewProps {
  soundEffectsCount: number;
  categoriesCount: number;
  onNavigateTab: (tab: 'dashboard' | 'upload' | 'catalog' | 'categories' | 'users' | 'analytics') => void;
}

export function AdminDashboardOverview({
  soundEffectsCount,
  categoriesCount,
  onNavigateTab,
}: AdminDashboardOverviewProps) {
  // Recent system & business events
  const recentEvents = [
    {
      id: 'ev-1',
      icon: 'credit',
      title: 'Đăng ký gói Pro VIP mới thành công',
      desc: 'Người dùng Sarah Connor vừa nâng cấp gói Pro 1 Tháng (69.000 đ)',
      time: '6 phút trước',
      type: 'success',
    },
    {
      id: 'ev-2',
      icon: 'download',
      title: 'Lượt tải âm thanh bản quyền',
      desc: 'Khách vãng lai tải "Fast Booted Gravel" (Lượt 4/5 trong ngày)',
      time: '14 phút trước',
      type: 'info',
    },
    {
      id: 'ev-3',
      icon: 'user',
      title: 'Tài khoản người dùng mới',
      desc: 'Elena Rodriguez (Game Dev) đã đăng ký qua Google OAuth',
      time: '28 phút trước',
      type: 'success',
    },
    {
      id: 'ev-4',
      icon: 'shield',
      title: 'Anti-Sniffer chặn yêu cầu cào âm thanh',
      desc: 'Đã tự động ngăn chặn công cụ python-requests từ IP 194.26.***.***',
      time: '1 giờ trước',
      type: 'warning',
    },
    {
      id: 'ev-5',
      icon: 'audio',
      title: 'Hiệu ứng âm thanh mới xuất bản',
      desc: 'Admin vừa tải lên "Sub Heavy Cinematic Impact" (WAV 44.1kHz)',
      time: '2 giờ trước',
      type: 'info',
    },
  ];

  // Top hot sounds
  const topHotSounds = [
    {
      title: 'Fast Booted Gravel',
      category: 'Foley > Footsteps',
      plays: 14250,
      downloads: 3840,
      likes: 483,
      growth: '+32.4%',
    },
    {
      title: 'Sub Heavy Cinematic Impact',
      category: 'Transitions > Impacts',
      plays: 11200,
      downloads: 2980,
      likes: 403,
      growth: '+24.1%',
    },
    {
      title: 'Birds in the Grove',
      category: 'Realistic > Wildlife',
      plays: 9840,
      downloads: 2450,
      likes: 256,
      growth: '+18.7%',
    },
    {
      title: 'Fast Hyperspeed Whoosh',
      category: 'Transitions > Whooshes',
      plays: 8760,
      downloads: 2120,
      likes: 378,
      growth: '+15.2%',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#161616] via-[#1a1a1a] to-[#141414] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Hệ Thống Trực Tuyến & Ổn Định (Uptime 99.98%)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dashboard Tổng Quan Hệ Thống & Chỉ Số Website
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Theo dõi toàn diện hiệu suất máy chủ, doanh thu gói Pro VIP, lượng tải âm thanh và người dùng hoạt động theo thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('upload')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              <span>Tải Lên SFX Mới</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('users')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-neutral-300" />
              <span>Quản Lý Tài Khoản</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Primary Business & Operations Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Doanh Thu Gói Pro VIP</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
              18.420.000 <span className="text-sm font-bold text-amber-400">đ</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +26.8% tháng này
              </span>
              <span className="text-neutral-500">267 lượt mua</span>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng Thành Viên</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
              1,280 <span className="text-sm font-medium text-neutral-400">người</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% tuần này
              </span>
              <span className="text-neutral-500">45 đăng ký mới/24h</span>
            </div>
          </div>
        </div>

        {/* Library Audio Assets Card */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kho Âm Thanh & Phân Loại</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
              {soundEffectsCount} <span className="text-sm font-medium text-neutral-400">SFX gốc</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[11px]">
              <span className="text-purple-400 font-medium">
                {categoriesCount} danh mục & 32 nhóm
              </span>
              <span className="text-neutral-500">24.5k lượt tải</span>
            </div>
          </div>
        </div>

        {/* Live Traffic Card */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lưu Lượng Hôm Nay</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
              19,840 <span className="text-sm font-medium text-neutral-400">views</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                32 người trực tuyến
              </span>
              <span className="text-neutral-500">14.2k khách</span>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure & Technical Website Parameters (Thông Số Kỹ Thuật & Tài Nguyên Website) */}
      <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Thông Số Kỹ Thuật & Tài Nguyên Hệ Thống Website</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Giám sát tình trạng phần cứng máy chủ, dung lượng ổ cứng, băng thông và bộ đệm âm thanh.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
            Node.js v20.17 • Next.js 16
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Storage Meter */}
          <div className="bg-[#1b1b1b] border border-neutral-700/60 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold text-neutral-300">Dung Lượng Âm Thanh</span>
              <span className="text-cyan-400 font-mono font-bold">4.82 GB / 50 GB</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden mb-2">
              <div className="w-[9.6%] h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Đã dùng 9.6%</span>
              <span className="text-emerald-400 font-medium">Còn trống 45.18 GB</span>
            </div>
          </div>

          {/* Bandwidth Meter */}
          <div className="bg-[#1b1b1b] border border-neutral-700/60 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold text-neutral-300">Băng Thông Mạng (Tháng)</span>
              <span className="text-purple-400 font-mono font-bold">128.4 GB / 1 TB</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden mb-2">
              <div className="w-[12.8%] h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Đã dùng 12.8%</span>
              <span className="text-emerald-400 font-medium">Tốc độ tối đa</span>
            </div>
          </div>

          {/* Response Latency */}
          <div className="bg-[#1b1b1b] border border-neutral-700/60 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="font-semibold text-neutral-300">Độ Trễ Phản Hồi API</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums my-1">
              38 <span className="text-xs font-normal text-neutral-400">ms</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Thời gian phản hồi cực nhanh</span>
            </div>
          </div>

          {/* Anti-Sniffing & Security Guard */}
          <div className="bg-[#1b1b1b] border border-neutral-700/60 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="font-semibold text-neutral-300">Bảo Vệ & Chống Cào File</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums my-1">
              428 <span className="text-xs font-normal text-neutral-400">bot đã chặn</span>
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Hạn mức: 5 lượt/ngày</span>
              <span className="text-emerald-400 font-bold">Kích hoạt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns Grid: Hot Sounds & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Hot Audio Tracks (7 Cols) */}
        <div className="lg:col-span-7 bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Hiệu Ứng Âm Thanh Thịnh Hành (Top Performing SFX)</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('catalog')}
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Xem kho ({soundEffectsCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topHotSounds.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#1b1b1b] border border-neutral-700/60 hover:border-neutral-600 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-400 flex-shrink-0">
                      0{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono truncate">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="font-bold text-neutral-200 tabular-nums">
                        {item.plays.toLocaleString('vi-VN')} nghe
                      </div>
                      <div className="text-[11px] text-neutral-400 tabular-nums">
                        {item.downloads.toLocaleString('vi-VN')} tải
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-rose-400 font-bold tabular-nums">
                        ❤️ {item.likes}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold font-mono">
                        {item.growth}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Âm thanh đang được tìm kiếm nhiều:</span>
            <span className="text-amber-300 font-medium">Bước chân (Footsteps), Nổ, Whoosh</span>
          </div>
        </div>

        {/* Recent System Events Timeline (5 Cols) */}
        <div className="lg:col-span-5 bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Nhật Ký Sự Kiện Hệ Thống Gần Đây</span>
              </h3>
              <span className="text-[11px] text-neutral-400">Realtime</span>
            </div>

            <div className="space-y-3.5">
              {recentEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 text-xs">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      ev.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                        : ev.type === 'warning'
                        ? 'bg-amber-950/60 border border-amber-800/60 text-amber-400'
                        : 'bg-blue-950/60 border border-blue-800/60 text-blue-400'
                    }`}
                  >
                    {ev.icon === 'credit' ? (
                      <CreditCard className="w-3.5 h-3.5" />
                    ) : ev.icon === 'shield' ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : ev.icon === 'user' ? (
                      <Users className="w-3.5 h-3.5" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{ev.title}</div>
                    <div className="text-[11px] text-neutral-400 leading-snug line-clamp-2">
                      {ev.desc}
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">
                    {ev.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>Xem toàn bộ thống kê lưu lượng</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
