import {
  AnalyticsSummary,
  TrafficTimeSeriesPoint,
  TrafficSource,
  DeviceBreakdown,
  TopPage,
  CountryStat,
  RealtimeVisitorLog,
} from '../types/analytics.js';

// Recent live logs
export const LIVE_VISITOR_LOGS: RealtimeVisitorLog[] = [
  {
    id: 'log-01',
    ipMasked: '113.190.***.***',
    city: 'Hà Nội',
    country: 'Việt Nam',
    flag: '🇻🇳',
    page: '/sound-effects/fast-booted-gravel',
    device: 'Desktop (Windows)',
    browser: 'Chrome 130',
    referrer: 'Google Search',
    timestamp: '2 giây trước',
  },
  {
    id: 'log-02',
    ipMasked: '14.232.***.***',
    city: 'Hồ Chí Minh',
    country: 'Việt Nam',
    flag: '🇻🇳',
    page: '/pricing',
    device: 'Mobile (iPhone 15)',
    browser: 'Safari Mobile',
    referrer: 'Direct Navigation',
    timestamp: '15 giây trước',
  },
  {
    id: 'log-03',
    ipMasked: '171.244.***.***',
    city: 'Đà Nẵng',
    country: 'Việt Nam',
    flag: '🇻🇳',
    page: '/?category=foley',
    device: 'Desktop (macOS)',
    browser: 'Chrome 130',
    referrer: 'YouTube / Editor Tips',
    timestamp: '42 giây trước',
  },
  {
    id: 'log-04',
    ipMasked: '104.28.***.***',
    city: 'Los Angeles',
    country: 'Hoa Kỳ',
    flag: '🇺🇸',
    page: '/sound-effects/sub-heavy-cinematic-impact',
    device: 'Desktop (macOS)',
    browser: 'Edge 130',
    referrer: 'Google Search',
    timestamp: '1 phút trước',
  },
  {
    id: 'log-05',
    ipMasked: '125.235.***.***',
    city: 'Cần Thơ',
    country: 'Việt Nam',
    flag: '🇻🇳',
    page: '/',
    device: 'Mobile (Samsung Galaxy)',
    browser: 'Chrome Mobile',
    referrer: 'TikTok SFX Creator',
    timestamp: '2 phút trước',
  },
  {
    id: 'log-06',
    ipMasked: '133.106.***.***',
    city: 'Tokyo',
    country: 'Nhật Bản',
    flag: '🇯🇵',
    page: '/?category=realistic',
    device: 'Desktop (Windows)',
    browser: 'Chrome 130',
    referrer: 'X (Twitter)',
    timestamp: '3 phút trước',
  },
  {
    id: 'log-07',
    ipMasked: '118.69.***.***',
    city: 'Hải Phòng',
    country: 'Việt Nam',
    flag: '🇻🇳',
    page: '/sound-effects/birds-in-the-grove',
    device: 'Desktop (Windows)',
    browser: 'Cốc Cốc 128',
    referrer: 'Facebook Group Video Editor',
    timestamp: '4 phút trước',
  },
  {
    id: 'log-08',
    ipMasked: '82.165.***.***',
    city: 'Berlin',
    country: 'Đức',
    flag: '🇩🇪',
    page: '/pricing',
    device: 'Desktop (Ubuntu)',
    browser: 'Firefox 132',
    referrer: 'Google Search',
    timestamp: '5 phút trước',
  },
];

// Top Pages
export const TOP_PAGES_DATA: TopPage[] = [
  {
    path: '/',
    title: 'Thư viện âm thanh chính (Sound Effects Studio)',
    views: 45280,
    uniqueViews: 32140,
    avgTime: '3m 42s',
    bounceRate: '28.4%',
  },
  {
    path: '/sound-effects/fast-booted-gravel',
    title: 'Chi tiết: Fast Booted Gravel Footsteps',
    views: 18450,
    uniqueViews: 14200,
    avgTime: '2m 18s',
    bounceRate: '22.1%',
  },
  {
    path: '/pricing',
    title: 'Bảng giá gói bản quyền Pro VIP (69k)',
    views: 14890,
    uniqueViews: 11520,
    avgTime: '4m 05s',
    bounceRate: '19.8%',
  },
  {
    path: '/?category=foley',
    title: 'Danh mục Foley & Bước chân tiếng động',
    views: 12640,
    uniqueViews: 9840,
    avgTime: '2m 54s',
    bounceRate: '31.2%',
  },
  {
    path: '/sound-effects/sub-heavy-cinematic-impact',
    title: 'Chi tiết: Sub Heavy Cinematic Impact',
    views: 11200,
    uniqueViews: 8900,
    avgTime: '1m 45s',
    bounceRate: '24.6%',
  },
  {
    path: '/?category=realistic',
    title: 'Danh mục Âm thanh Thực tế & Động vật',
    views: 8940,
    uniqueViews: 7120,
    avgTime: '2m 12s',
    bounceRate: '34.5%',
  },
];

// Traffic Sources
export const TRAFFIC_SOURCES_DATA: TrafficSource[] = [
  {
    source: 'Google Tìm kiếm (SEO)',
    category: 'Search',
    visits: 38450,
    percentage: 42.5,
    change: '+14.2%',
  },
  {
    source: 'Truy cập trực tiếp (Direct URL)',
    category: 'Direct',
    visits: 23890,
    percentage: 26.4,
    change: '+8.7%',
  },
  {
    source: 'YouTube Video & SFX Links',
    category: 'Social',
    visits: 14320,
    percentage: 15.8,
    change: '+22.4%',
  },
  {
    source: 'TikTok / CapCut Editor Community',
    category: 'Social',
    visits: 8940,
    percentage: 9.9,
    change: '+31.8%',
  },
  {
    source: 'Facebook Groups & Giới thiệu',
    category: 'Referral',
    visits: 4890,
    percentage: 5.4,
    change: '+5.1%',
  },
];

// Device Breakdown
export const DEVICE_BREAKDOWN_DATA: DeviceBreakdown[] = [
  {
    device: 'Máy tính để bàn (Desktop / Laptop)',
    icon: 'Monitor',
    percentage: 64.2,
    count: 58120,
  },
  {
    device: 'Điện thoại di động (Smartphones)',
    icon: 'Smartphone',
    percentage: 29.6,
    count: 26780,
  },
  {
    device: 'Máy tính bảng (iPad / Tablets)',
    icon: 'Tablet',
    percentage: 6.2,
    count: 5610,
  },
];

// Top Countries
export const TOP_COUNTRIES_DATA: CountryStat[] = [
  { country: 'Việt Nam', code: 'VN', flag: '🇻🇳', visitors: 62450, percentage: 68.9 },
  { country: 'Hoa Kỳ (USA)', code: 'US', flag: '🇺🇸', visitors: 11200, percentage: 12.4 },
  { country: 'Nhật Bản', code: 'JP', flag: '🇯🇵', visitors: 4890, percentage: 5.4 },
  { country: 'Hàn Quốc', code: 'KR', flag: '🇰🇷', visitors: 3950, percentage: 4.4 },
  { country: 'Đức', code: 'DE', flag: '🇩🇪', visitors: 2840, percentage: 3.1 },
  { country: 'Khác', code: 'OTHER', flag: '🌍', visitors: 5180, percentage: 5.8 },
];

// 7 Days Time Series
export const TIME_SERIES_7D: TrafficTimeSeriesPoint[] = [
  { date: '2026-10-26', label: 'T2 (26/10)', pageviews: 9420, visitors: 6840, plays: 14200, downloads: 3120 },
  { date: '2026-10-27', label: 'T3 (27/10)', pageviews: 11250, visitors: 7920, plays: 16800, downloads: 3840 },
  { date: '2026-10-28', label: 'T4 (28/10)', pageviews: 12890, visitors: 8940, plays: 19450, downloads: 4210 },
  { date: '2026-10-29', label: 'T5 (29/10)', pageviews: 14200, visitors: 9850, plays: 21300, downloads: 4890 },
  { date: '2026-10-30', label: 'T6 (30/10)', pageviews: 15980, visitors: 11200, plays: 24100, downloads: 5460 },
  { date: '2026-10-31', label: 'T7 (31/10)', pageviews: 18450, visitors: 13120, plays: 27800, downloads: 6320 },
  { date: '2026-11-01', label: 'CN (Hôm nay)', pageviews: 19840, visitors: 14230, plays: 29400, downloads: 6890 },
];

// 30 Days Time Series
export const TIME_SERIES_30D: TrafficTimeSeriesPoint[] = Array.from({ length: 30 }).map((_, i) => {
  const day = i + 1;
  const baseViews = 8000 + Math.round(Math.sin(i / 3) * 2500) + i * 280;
  const baseVisitors = Math.round(baseViews * 0.68);
  const basePlays = Math.round(baseViews * 1.45);
  const baseDownloads = Math.round(baseViews * 0.32);

  return {
    date: `2026-10-${day < 10 ? '0' : ''}${day}`,
    label: `${day}/10`,
    pageviews: baseViews,
    visitors: baseVisitors,
    plays: basePlays,
    downloads: baseDownloads,
  };
});
