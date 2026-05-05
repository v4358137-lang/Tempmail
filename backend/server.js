require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors()); // Allow all origins for maximum compatibility

app.use(express.json());

// ─── RATE LIMIT ──────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 2000,  // 2 seconds
  max: 10,         // Slightly higher limit for production
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, slow down.' },
});
app.use('/api', limiter);

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/email', emailRoutes);

// ─── HEALTH CHECK (For UptimeRobot & Render) ─────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));
app.get('/', (_req, res) => res.send('TempMail API is running. Point your frontend to this URL.'));

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TempMail Backend API running on port ${PORT}`);
});
