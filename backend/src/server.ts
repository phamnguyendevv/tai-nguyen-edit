import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sfxRoutes from './routes/sfx-routes.js';
import authRoutes from './routes/auth-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static audio assets
const publicAudioDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicAudioDir));

// API Routes
app.use('/api', sfxRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SFX Backend API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎵 SFX Backend API running at http://localhost:${PORT}`);
  console.log(`📁 Static audio served at http://localhost:${PORT}/audio/sfx/`);
});
