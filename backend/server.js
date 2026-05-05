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

// ─── STATIC FILES (FRONTEND) ──────────────────────────────────────────────────
const path = require('path');
const distPath = path.join(__dirname, 'dist');

// Serve static files if the dist folder exists
app.use(express.static(distPath));

// Health check for Render
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Handle SPA routing: return index.html for all non-api routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('API is running. Frontend build missing or not found in /backend/dist');
    }
  });
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Unified TempMail service running on port ${PORT}`);
});
