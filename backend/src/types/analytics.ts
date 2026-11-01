export interface TrafficTimeSeriesPoint {
  date: string;
  label: string;
  pageviews: number;
  visitors: number;
  plays: number;
  downloads: number;
}

export interface TrafficSource {
  source: string;
  category: 'Direct' | 'Search' | 'Social' | 'Referral';
  visits: number;
  percentage: number;
  change: string;
}

export interface DeviceBreakdown {
  device: string;
  icon: string;
  percentage: number;
  count: number;
}

export interface TopPage {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTime: string;
  bounceRate: string;
}

export interface CountryStat {
  country: string;
  code: string;
  flag: string;
  visitors: number;
  percentage: number;
}

export interface RealtimeVisitorLog {
  id: string;
  ipMasked: string;
  city: string;
  country: string;
  flag: string;
  page: string;
  device: string;
  browser: string;
  referrer: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  timeRange: 'today' | '7d' | '30d' | 'all';
  activeLiveVisitors: number;
  totalPageviews: number;
  pageviewsGrowth: number;
  uniqueVisitors: number;
  visitorsGrowth: number;
  avgSessionDurationSeconds: number;
  avgSessionDurationFormatted: string;
  durationGrowth: number;
  bounceRate: number;
  bounceRateGrowth: number;
  totalAudioPlays: number;
  totalDownloads: number;
  timeSeries: TrafficTimeSeriesPoint[];
  sources: TrafficSource[];
  devices: DeviceBreakdown[];
  topPages: TopPage[];
  topCountries: CountryStat[];
  recentLogs: RealtimeVisitorLog[];
}
