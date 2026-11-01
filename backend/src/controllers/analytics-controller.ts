import { Request, Response } from 'express';
import {
  TIME_SERIES_7D,
  TIME_SERIES_30D,
  TRAFFIC_SOURCES_DATA,
  DEVICE_BREAKDOWN_DATA,
  TOP_PAGES_DATA,
  TOP_COUNTRIES_DATA,
  LIVE_VISITOR_LOGS,
} from '../data/analytics.js';
import { AnalyticsSummary, RealtimeVisitorLog } from '../types/analytics.js';

let dynamicLogs: RealtimeVisitorLog[] = [...LIVE_VISITOR_LOGS];

export class AnalyticsController {
  /**
   * Get analytics dashboard data (Admin only)
   */
  static async getAnalytics(req: Request, res: Response) {
    try {
      const timeRange = (req.query.range as string) || '7d';

      const is30d = timeRange === '30d' || timeRange === 'all';
      const timeSeries = is30d ? TIME_SERIES_30D : TIME_SERIES_7D;

      const totalPageviews = timeSeries.reduce((acc, p) => acc + p.pageviews, 0);
      const uniqueVisitors = timeSeries.reduce((acc, p) => acc + p.visitors, 0);
      const totalAudioPlays = timeSeries.reduce((acc, p) => acc + p.plays, 0);
      const totalDownloads = timeSeries.reduce((acc, p) => acc + p.downloads, 0);

      // Randomize live active count slightly around 28-36 to simulate real activity
      const activeLiveVisitors = 28 + Math.floor(Math.sin(Date.now() / 60000) * 8);

      const summary: AnalyticsSummary = {
        timeRange: (timeRange as any) || '7d',
        activeLiveVisitors,
        totalPageviews,
        pageviewsGrowth: 18.4,
        uniqueVisitors,
        visitorsGrowth: 12.8,
        avgSessionDurationSeconds: 198,
        avgSessionDurationFormatted: '3m 18s',
        durationGrowth: 6.5,
        bounceRate: 26.4,
        bounceRateGrowth: -3.2, // negative bounce rate growth is positive performance
        totalAudioPlays,
        totalDownloads,
        timeSeries,
        sources: TRAFFIC_SOURCES_DATA,
        devices: DEVICE_BREAKDOWN_DATA,
        topPages: TOP_PAGES_DATA,
        topCountries: TOP_COUNTRIES_DATA,
        recentLogs: dynamicLogs.slice(0, 10),
      };

      return res.status(200).json(summary);
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return res.status(500).json({ error: 'Failed to retrieve analytics data' });
    }
  }

  /**
   * Track client pageview (Public tracking endpoint)
   */
  static async trackPageView(req: Request, res: Response) {
    try {
      const { path, title, referrer } = req.body;
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Mask IP
      const parts = ip.split('.');
      const ipMasked = parts.length >= 4 ? `${parts[0]}.${parts[1]}.***.***` : '113.190.***.***';

      let device = 'Desktop (Web)';
      if (/iphone|android|mobile/i.test(userAgent)) {
        device = 'Mobile Device';
      } else if (/ipad|tablet/i.test(userAgent)) {
        device = 'Tablet';
      }

      let browser = 'Chrome';
      if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
      else if (/firefox/i.test(userAgent)) browser = 'Firefox';
      else if (/edg/i.test(userAgent)) browser = 'Edge';

      const newLog: RealtimeVisitorLog = {
        id: `log-${Date.now()}`,
        ipMasked,
        city: 'Hà Nội',
        country: 'Việt Nam',
        flag: '🇻🇳',
        page: path || '/',
        device,
        browser,
        referrer: referrer || 'Direct Navigation',
        timestamp: 'Vừa xong',
      };

      dynamicLogs.unshift(newLog);
      if (dynamicLogs.length > 50) {
        dynamicLogs = dynamicLogs.slice(0, 50);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(200).json({ success: false });
    }
  }
}
