require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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

// ─── STATIC FILES (Serve Frontend) ───────────────────────────────────────────
// Serve static files from the React app dist folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ─── CATCH-ALL (Fix 404 on Reload) ───────────────────────────────────────────
// For any request that doesn't match an API route, send back the index.html
app.get('*', (req, res) => {
  // If it's an API request that wasn't caught, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TempMail Backend API running on port ${PORT}`);
});
