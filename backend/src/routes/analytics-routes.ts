import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics-controller.js';
import { requireAdmin } from '../middleware/auth-middleware.js';

const router = Router();

// Admin analytics dashboard
router.get('/admin/analytics', requireAdmin, AnalyticsController.getAnalytics);

// Public track pageview
router.post('/analytics/track', AnalyticsController.trackPageView);

export default router;
