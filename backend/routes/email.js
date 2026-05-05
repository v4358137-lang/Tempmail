const express = require('express');
const router = express.Router();
const mail = require('../services/mailService');

// ─── Wrap async handlers ──────────────────────────────────────────────────────
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── GET /api/email/domains ───────────────────────────────────────────────────
router.get('/domains', asyncHandler(async (req, res) => {
  const domains = await mail.getDomains();
  res.json({ success: true, domains });
}));

// ─── POST /api/email/create ───────────────────────────────────────────────────
// Creates a new disposable email account
router.post('/create', asyncHandler(async (req, res) => {
  const account = await mail.createAccount(req.body?.domain);
  res.json({ success: true, ...account });
}));

// ─── POST /api/email/restore ──────────────────────────────────────────────────
// Restores a session from stored credentials
router.post('/restore', asyncHandler(async (req, res) => {
  const { address, password } = req.body;
  if (!address || !password) {
    return res.status(400).json({ success: false, error: 'Missing credentials' });
  }
  try {
    const tokenData = await mail.getToken(address, password);
    res.json({ success: true, ...tokenData });
  } catch (err) {
    // Session expired on mail.tm side
    res.status(401).json({ success: false, error: 'Session expired or invalid' });
  }
}));

// ─── GET /api/email/messages ──────────────────────────────────────────────────
// Fetches inbox messages
router.get('/messages', asyncHandler(async (req, res) => {
  const { token } = req.headers;
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  const messages = await mail.getMessages(token);
  res.json({ success: true, messages });
}));

// ─── GET /api/email/messages/:id ─────────────────────────────────────────────
// Fetches single message full body
router.get('/messages/:id', asyncHandler(async (req, res) => {
  const { token } = req.headers;
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  const message = await mail.getMessage(token, req.params.id);
  res.json({ success: true, message });
}));

// ─── DELETE /api/email/messages/:id ──────────────────────────────────────────
router.delete('/messages/:id', asyncHandler(async (req, res) => {
  const { token } = req.headers;
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  await mail.deleteMessage(token, req.params.id);
  res.json({ success: true });
}));

// ─── DELETE /api/email/account ────────────────────────────────────────────────
router.delete('/account', asyncHandler(async (req, res) => {
  const { token } = req.headers;
  const { accountId } = req.body;
  if (!token || !accountId) return res.status(400).json({ success: false, error: 'Missing params' });
  await mail.deleteAccount(token, accountId);
  res.json({ success: true });
}));

// ─── Error handler ────────────────────────────────────────────────────────────
router.use((err, req, res, _next) => {
  console.error('[Email Route Error]', err.message);
  const status = err.response?.status || 500;
  const message = err.response?.data?.['hydra:description'] || err.message || 'Server error';
  res.status(status).json({ success: false, error: message });
});

module.exports = router;
