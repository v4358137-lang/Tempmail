import axios from 'axios';

let BASE_URL = import.meta.env.VITE_API_URL || "https://tempmail-backend-7taa.onrender.com";

// Ensure protocol for Render host-only env vars
if (BASE_URL && !BASE_URL.startsWith('http')) {
  BASE_URL = `https://${BASE_URL}`;
}

const api = axios.create({
  baseURL: `${BASE_URL}/api/email`,
  timeout: 15000, // Slightly longer for free-tier cold starts
});

// ─── FAIL SAFE & LOGGING ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error);
    // Return safe empty data for specific patterns to prevent UI hang
    if (error.config?.url?.includes('/domains')) return { data: [] };
    if (error.config?.url?.includes('/messages')) return { data: [] };
    return Promise.reject(error);
  }
);

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
