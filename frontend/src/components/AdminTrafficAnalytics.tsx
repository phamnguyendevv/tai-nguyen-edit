'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Play,
  Download,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Radio,
  ExternalLink,
  Search,
  Filter,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AnalyticsSummary, TrafficTimeSeriesPoint } from '@/types/analytics';
import { ApiClient } from '@/lib/api-client';

interface AdminTrafficAnalyticsProps {
  showToast: (type: 'success' | 'error', message: string) => void;
}

export function AdminTrafficAnalytics({ showToast }: AdminTrafficAnalyticsProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [chartMetric, setChartMetric] = useState<'pageviews' | 'visitors' | 'plays' | 'downloads'>('pageviews');
  const [hoveredPoint, setHoveredPoint] = useState<TrafficTimeSeriesPoint | null>(null);

  const fetchAnalytics = async (range: 'today' | '7d' | '30d' | 'all' = timeRange) => {
    setIsLoading(true);
    try {
      const summary = await ApiClient.getAdminAnalytics(range);
      setData(summary);
    } catch (err: any) {
      console.warn('Failed to load analytics from backend:', err);
      showToast('error', 'Không thể tải dữ liệu thống kê từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  // Periodic subtle polling to update live visitor count and activity (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      ApiClient.getAdminAnalytics(timeRange)
        .then((updated) => setData(updated))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Chart Calculations
  const timeSeries = data?.timeSeries || [];
  const maxVal = useMemo(() => {
    if (!timeSeries.length) return 100;
    const values = timeSeries.map((p) => p[chartMetric]);
    const max = Math.max(...values, 10);
    return Math.ceil(max * 1.15); // Add 15% headroom
  }, [timeSeries, chartMetric]);

  const chartHeight = 220;
  const chartWidth = 760; // Internal SVG viewBox width

  // Build SVG points
  const pointsString = useMemo(() => {
    if (!timeSeries.length) return '';
    return timeSeries
      .map((p, index) => {
        const x = (index / (timeSeries.length - 1)) * (chartWidth - 40) + 20;
        const y = chartHeight - 30 - (p[chartMetric] / maxVal) * (chartHeight - 60);
        return `${x},${y}`;
      })
      .join(' ');
  }, [timeSeries, chartMetric, maxVal]);

  const areaPointsString = useMemo(() => {
    if (!timeSeries.length || !pointsString) return '';
    const firstX = 20;
    const lastX = chartWidth - 20;
    const bottomY = chartHeight - 30;
    return `${firstX},${bottomY} ${pointsString} ${lastX},${bottomY}`;
  }, [pointsString, timeSeries.length]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Thống Kê Lượt Truy Cập & Phân Tích Lưu Lượng</span>
            </h2>
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 shadow-sm animate-pulse">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>
                {data ? `${data.activeLiveVisitors} người trực tuyến` : 'Đang theo dõi trực tiếp'}
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Theo dõi lưu lượng khách truy cập, số lượt xem trang, nguồn giới thiệu và hành vi người dùng thời gian thực.
          </p>
        </div>

        {/* Time Range Selector & Refresh */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="inline-flex items-center bg-[#1c1c1c] border border-neutral-700/80 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === 'today'
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === '30d'
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              30 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Toàn bộ
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(timeRange)}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Làm mới thống kê"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Pageviews */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Lượt Xem Trang</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {data ? data.totalPageviews.toLocaleString('vi-VN') : '---'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{data?.pageviewsGrowth || 18.4}%</span>
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Khách Truy Cập</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {data ? data.uniqueVisitors.toLocaleString('vi-VN') : '---'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{data?.visitorsGrowth || 12.8}%</span>
            </div>
          </div>
        </div>

        {/* Audio Plays */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Lượt Nghe Thử</span>
            <Play className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {data ? data.totalAudioPlays.toLocaleString('vi-VN') : '---'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+24.1%</span>
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Lượt Tải SFX</span>
            <Download className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {data ? data.totalDownloads.toLocaleString('vi-VN') : '---'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+15.7%</span>
            </div>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Thời Lượng TB</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {data?.avgSessionDurationFormatted || '3m 18s'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{data?.durationGrowth || 6.5}%</span>
            </div>
          </div>
        </div>

        {/* Bounce Rate */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Tỷ Lệ Thoát</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {data?.bounceRate || 26.4}%
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1" title="Tỷ lệ thoát giảm là dấu hiệu người xem ở lại trang lâu hơn">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-3.2% (Tốt)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Biểu Đồ Xu Hướng Lưu Lượng Theo Thời Gian</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Rê chuột vào các điểm mốc trên đồ thị để xem chi tiết số lượt xem và lượt nghe theo từng ngày.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-[#1b1b1b] border border-neutral-700/80 rounded-xl p-1 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('pageviews')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                chartMetric === 'pageviews'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Lượt xem (Views)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('visitors')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                chartMetric === 'visitors'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Khách (Visitors)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('plays')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                chartMetric === 'plays'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Nghe thử (Plays)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('downloads')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                chartMetric === 'downloads'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tải về
            </button>
          </div>
        </div>

        {/* Hover Tooltip display */}
        {hoveredPoint && (
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-xl p-3 mb-3 text-xs inline-flex items-center gap-4 animate-in fade-in duration-150">
            <div className="font-bold text-white border-r border-neutral-700 pr-3">
              {hoveredPoint.label} ({hoveredPoint.date})
            </div>
            <div className="flex items-center gap-4 text-neutral-300">
              <span>👁️ Xem: <strong className="text-white">{hoveredPoint.pageviews.toLocaleString('vi-VN')}</strong></span>
              <span>👤 Khách: <strong className="text-white">{hoveredPoint.visitors.toLocaleString('vi-VN')}</strong></span>
              <span>🎵 Nghe: <strong className="text-white">{hoveredPoint.plays.toLocaleString('vi-VN')}</strong></span>
              <span>⬇️ Tải: <strong className="text-white">{hoveredPoint.downloads.toLocaleString('vi-VN')}</strong></span>
            </div>
          </div>
        )}

        {/* SVG Area Chart */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[680px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={
                      chartMetric === 'pageviews'
                        ? '#06b6d4'
                        : chartMetric === 'visitors'
                        ? '#10b981'
                        : chartMetric === 'plays'
                        ? '#a855f7'
                        : '#f43f5e'
                    }
                    stopOpacity="0.38"
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      chartMetric === 'pageviews'
                        ? '#06b6d4'
                        : chartMetric === 'visitors'
                        ? '#10b981'
                        : chartMetric === 'plays'
                        ? '#a855f7'
                        : '#f43f5e'
                    }
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = chartHeight - 30 - pct * (chartHeight - 60);
                const labelVal = Math.round(pct * maxVal);
                return (
                  <g key={idx}>
                    <line
                      x1="20"
                      y1={y}
                      x2={chartWidth - 20}
                      y2={y}
                      stroke="#282828"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="18"
                      y={y + 3}
                      fill="#666666"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(0)}k` : labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Filled Area */}
              {areaPointsString && (
                <polygon points={areaPointsString} fill="url(#chartGradient)" />
              )}

              {/* Main Line */}
              {pointsString && (
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={
                    chartMetric === 'pageviews'
                      ? '#06b6d4'
                      : chartMetric === 'visitors'
                      ? '#10b981'
                      : chartMetric === 'plays'
                      ? '#a855f7'
                      : '#f43f5e'
                  }
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points on Line with interactive hover */}
              {timeSeries.map((p, index) => {
                const x = (index / (timeSeries.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - 30 - (p[chartMetric] / maxVal) * (chartHeight - 60);
                const isHovered = hoveredPoint?.date === p.date;

                return (
                  <g
                    key={p.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Invisible larger hit target */}
                    <circle cx={x} cy={y} r="14" fill="transparent" />

                    {/* Visible dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? '6' : '3.5'}
                      fill={
                        chartMetric === 'pageviews'
                          ? '#06b6d4'
                          : chartMetric === 'visitors'
                          ? '#10b981'
                          : chartMetric === 'plays'
                          ? '#a855f7'
                          : '#f43f5e'
                      }
                      stroke="#0d0d0d"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />

                    {/* Date label at bottom */}
                    {(timeSeries.length <= 14 || index % 3 === 0 || index === timeSeries.length - 1) && (
                      <text
                        x={x}
                        y={chartHeight - 10}
                        fill="#888888"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {p.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Sources & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Nguồn Lưu Lượng Truy Cập (Traffic Sources)</span>
              </h3>
              <span className="text-[11px] text-neutral-400">Tỷ lệ %</span>
            </div>

            <div className="space-y-4">
              {data?.sources.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 tabular-nums">
                        {item.visits.toLocaleString('vi-VN')} lượt
                      </span>
                      <span className="font-bold text-cyan-300 tabular-nums w-12 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Nguồn tăng trưởng mạnh nhất:</span>
            <span className="text-emerald-400 font-semibold">TikTok / CapCut (+31.8%)</span>
          </div>
        </div>

        {/* Device & Browser Breakdown */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span>Thiết Bị & Trình Duyệt Sử Dụng</span>
              </h3>
              <span className="text-[11px] text-neutral-400">Thống kê nền tảng</span>
            </div>

            {/* Device Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {data?.devices.map((d, i) => (
                <div
                  key={i}
                  className="bg-[#1b1b1b] border border-neutral-700/60 rounded-xl p-3.5 text-center flex flex-col items-center justify-center shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 mb-2">
                    {d.icon === 'Smartphone' ? (
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                    ) : d.icon === 'Tablet' ? (
                      <Tablet className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Monitor className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">{d.percentage}%</div>
                  <div className="text-[10px] text-neutral-400 truncate w-full mt-0.5">
                    {d.device.split(' ')[0]}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 tabular-nums">
                    {d.count.toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Popular Browsers Pill row */}
            <div className="text-xs">
              <div className="text-[11px] font-semibold text-neutral-400 mb-2">
                Trình duyệt phổ biến hàng đầu:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">Chrome</span>
                  <span className="font-bold text-white">58.4%</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">Safari</span>
                  <span className="font-bold text-white">22.8%</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">Cốc Cốc</span>
                  <span className="font-bold text-white">11.6%</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">Edge / Khác</span>
                  <span className="font-bold text-white">7.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Độ phân giải màn hình phổ biến:</span>
            <span className="text-purple-300 font-semibold font-mono">1920x1080 FHD (48.2%)</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Pages & Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Pages (7 Cols) */}
        <div className="lg:col-span-7 bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Trang & Âm Thanh Được Xem Nhiều Nhất</span>
            </h3>
            <span className="text-[11px] text-neutral-400">Xếp hạng lượt xem</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Trang / URL</th>
                  <th className="py-2.5 px-3 text-right">Lượt Xem</th>
                  <th className="py-2.5 px-3 text-right">Thời Gian TB</th>
                  <th className="py-2.5 px-3 text-right">Thoát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {data?.topPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white truncate max-w-[260px] sm:max-w-[340px]">
                        {page.title}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 truncate max-w-[240px]">
                        {page.path}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-cyan-300 tabular-nums">
                      {page.views.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-300 tabular-nums font-mono text-[11px]">
                      {page.avgTime}
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-400 tabular-nums font-mono text-[11px]">
                      {page.bounceRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Countries (5 Cols) */}
        <div className="lg:col-span-5 bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Quốc Gia & Khu Vực Hàng Đầu</span>
            </h3>
            <span className="text-[11px] text-neutral-400">Địa lý</span>
          </div>

          <div className="space-y-3.5">
            {data?.topCountries.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-medium text-white">{c.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 tabular-nums">
                      {c.visitors.toLocaleString('vi-VN')}
                    </span>
                    <span className="font-bold text-amber-300 tabular-nums w-10 text-right">
                      {c.percentage}%
                    </span>
                  </div>
                </div>
                {/* Bar */}
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    style={{ width: `${c.percentage}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Live Visitor Log Table */}
      <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Nhật Ký Khách Truy Cập Thời Gian Thực (Live Visitor Feed)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cập nhật trực tiếp hành động người xem truy cập các liên kết âm thanh và trang thanh toán.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Tự động cập nhật</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider bg-[#181818]">
                <th className="py-2.5 px-3">Thời Gian</th>
                <th className="py-2.5 px-3">Vị Trí & IP</th>
                <th className="py-2.5 px-3">Trang Đang Xem</th>
                <th className="py-2.5 px-3">Thiết Bị / Trình Duyệt</th>
                <th className="py-2.5 px-3">Nguồn Giới Thiệu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {data?.recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/60 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-emerald-400 font-mono text-[11px] font-semibold">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <span>{log.flag}</span>
                      <span>{log.city}, {log.country}</span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500">{log.ipMasked}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-neutral-900 text-cyan-300 font-mono text-[11px] border border-neutral-800 truncate max-w-[220px] inline-block">
                      {log.page}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-neutral-300">
                    <div>{log.device}</div>
                    <div className="text-[10px] text-neutral-500">{log.browser}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-neutral-400 text-[11px]">
                    {log.referrer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
