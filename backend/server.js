require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Allow all origins for maximum compatibility on Render

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
