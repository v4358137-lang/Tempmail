// ─── Storage keys ──────────────────────────────────────────────────────────
const KEYS = {
  ADDRESS:  'tmpmail_address',
  PASSWORD: 'tmpmail_password',
  TOKEN:    'tmpmail_token',
  ACCOUNT_ID: 'tmpmail_account_id',
  EXPIRE_AT:  'tmpmail_expire_at',
  SESSIONS: 'tmpmail_sessions_list',
};

const TEN_MINUTES = 10 * 60 * 1000;

// ─── Multi-session support ─────────────────────────────────────────────────
export function loadSessionList() {
  const data = localStorage.getItem(KEYS.SESSIONS);
  let list = [];
  if (data) {
    try { list = JSON.parse(data); } catch(e){}
  }
  // Migrate old single session if list is empty
  if (list.length === 0) {
    const old = loadSession();
    if (old) {
      list = [old];
      saveSessionList(list);
    }
  }
  return list.filter(s => !isExpired(s.expireAt)); // automatically purge expired
}

export function saveSessionList(sessions) {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

// ─── Single Session (Backward Compatibility) ───────────────────────────────
export function saveSession({ address, password, token, id, expireAt, createdAt }) {
  localStorage.setItem(KEYS.ADDRESS,    address);
  localStorage.setItem(KEYS.PASSWORD,   password);
  localStorage.setItem(KEYS.TOKEN,      token);
  localStorage.setItem(KEYS.ACCOUNT_ID, id || '');
  localStorage.setItem(KEYS.EXPIRE_AT,  expireAt || String(Date.now() + TEN_MINUTES));
}

export function loadSession() {
  const address   = localStorage.getItem(KEYS.ADDRESS);
  const password  = localStorage.getItem(KEYS.PASSWORD);
  const token     = localStorage.getItem(KEYS.TOKEN);
  const id        = localStorage.getItem(KEYS.ACCOUNT_ID);
  const expireAt  = Number(localStorage.getItem(KEYS.EXPIRE_AT));
  if (!address || !token) return null;
  return { address, password, token, id, expireAt, createdAt: Date.now() };
}

export function clearSession() {
  Object.values(KEYS).forEach(k => {
    if (k !== KEYS.SESSIONS) localStorage.removeItem(k);
  });
}

// ─── Extend session ─────────────────────────────────────────────────────────
export function extendSession() {
  const current = Number(localStorage.getItem(KEYS.EXPIRE_AT)) || Date.now();
  const newExpiry = current + TEN_MINUTES;
  localStorage.setItem(KEYS.EXPIRE_AT, String(newExpiry));
  return newExpiry;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
export function isExpired(expireAt) {
  return Date.now() > expireAt;
}

export function timeLeft(expireAt) {
  return Math.max(0, expireAt - Date.now());
}

export function formatTime(ms) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export { TEN_MINUTES };
