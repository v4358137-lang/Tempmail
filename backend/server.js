require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:4173',  // vite preview
  'https://*.onrender.com', // render deployments
];

// ─── ENSURE PROTOCOL ─────────────────────────────────────────────────────────
// Render's Blueprint 'host' property doesn't include https://
const sanitizedOrigins = allowedOrigins.map(o => {
  if (o && !o.startsWith('http') && !o.includes('*')) return `https://${o}`;
  return o;
});

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (no origin) and whitelisted origins
    if (!origin) return cb(null, true);
    const ok = sanitizedOrigins.some(o => {
      if (o.includes('*')) {
        const pattern = new RegExp('^' + o.replace(/\*/g, '.*') + '$');
        return pattern.test(origin);
      }
      return o === origin;
    });
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
}));

app.use(express.json());

// ─── RATE LIMIT ──────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 2000,  // 2 seconds
  max: 8,          // max 4 QPS, well under mail.tm 8 QPS limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, slow down.' },
});
app.use('/api', limiter);

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/email', emailRoutes);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 TempMail backend running on port ${PORT}`);
});
