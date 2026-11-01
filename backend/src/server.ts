import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sfxRoutes from './routes/sfx-routes.js';
import authRoutes from './routes/auth-routes.js';
import userRoutes from './routes/user-routes.js';
import analyticsRoutes from './routes/analytics-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Anti-sniffing & Anti-leeching Protection Middleware for Audio Assets
app.use('/audio/sfx', (req, res, next) => {
  const referer = req.headers['referer'] || req.headers['origin'] || '';
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const playerHeader = req.headers['x-requested-with'] || '';
  const secFetchDest = req.headers['sec-fetch-dest'] || '';

  const allowedHosts = ['localhost', '127.0.0.1'];
  const hasValidReferer = allowedHosts.some((host) => referer.includes(host));

  const isDirectNavigation = secFetchDest === 'document';
  const isSuspiciousTool =
    !hasValidReferer &&
    (!referer ||
      userAgent.includes('curl') ||
      userAgent.includes('wget') ||
      userAgent.includes('python') ||
      userAgent.includes('idm') ||
      userAgent.includes('download') ||
      userAgent.includes('aria2'));

  if (isDirectNavigation || isSuspiciousTool || (!hasValidReferer && playerHeader !== 'SFX-WebPlayer')) {
    return res.status(403).json({
      error: 'Access Denied: Direct media sniffing detected.',
      message:
        'Direct access to raw audio files is protected against automated sniffing. Please listen via the web player or use the official platform download button.',
      status: 403,
      timestamp: new Date().toISOString(),
    });
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Content-Disposition', 'inline; filename="preview"');
  res.setHeader('X-Protected-By', 'SFX-AntiSniffer-Guard');
  next();
});

// Serve static audio assets
const publicAudioDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicAudioDir));

// API Routes
app.use('/api', sfxRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SFX Backend API', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'File âm thanh vượt quá giới hạn tải lên của máy chủ (tối đa 100MB).',
    });
  }
  console.error('Unhandled server error:', err);
  return res.status(500).json({ error: err.message || 'Lỗi xử lý nội bộ của máy chủ' });
});

app.listen(PORT, () => {
  console.log(`🎵 SFX Backend API running at http://localhost:${PORT}`);
  console.log(`📁 Static audio served at http://localhost:${PORT}/audio/sfx/`);
});
