import axios from 'axios';

let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Ensure protocol for Render host-only env vars
if (BASE_URL && !BASE_URL.startsWith('http')) {
  BASE_URL = `https://${BASE_URL}`;
}

const api = axios.create({
  baseURL: `${BASE_URL}/api/email`,
  timeout: 12000,
});

// ─── Account ─────────────────────────────────────────────────────────────────
export const getDomains = () =>
  api.get('/domains').then(r => r.data);

export const createEmail = (domain) =>
  api.post('/create', { domain }).then(r => r.data);

export const restoreSession = (address, password) =>
  api.post('/restore', { address, password }).then(r => r.data);

// ─── Messages ─────────────────────────────────────────────────────────────────
export const getMessages = (token) =>
  api.get('/messages', { headers: { token } }).then(r => r.data);

export const getMessage = (token, id) =>
  api.get(`/messages/${id}`, { headers: { token } }).then(r => r.data);

export const deleteMessage = (token, id) =>
  api.delete(`/messages/${id}`, { headers: { token } }).then(r => r.data);

export const deleteAccount = (token, accountId) =>
  api.delete('/account', {
    headers: { token },
    data: { accountId },
  }).then(r => r.data);

export default api;
