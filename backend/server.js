require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const emailRoutes = require('./routes/email');
const fs = require('fs');

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
// In production, the frontend 'dist' folder is copied inside the 'backend' folder
const distPath = path.join(__dirname, 'dist');
console.log(`[Server] Serving static files from: ${distPath}`);

if (fs.existsSync(distPath)) {
  console.log(`[Server] Content of dist: ${fs.readdirSync(distPath).join(', ')}`);
} else {
  console.warn(`[Server] WARNING: distPath does not exist: ${distPath}`);
}

app.use(express.static(distPath));

// ─── ROOT ROUTE ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── CATCH-ALL (Fix 404 on Reload) ───────────────────────────────────────────
app.get('*', (req, res) => {
  // If it's an API request that wasn't caught, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(distPath, 'index.html');
  
  // Prevent caching of index.html so reloads always check the server
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[Server] Error sending index.html: ${err.message} at ${indexPath}`);
      res.status(500).send('Frontend build missing or inaccessible. Please check Render build logs.');
    }
  });
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TempMail Backend API running on port ${PORT}`);
});
