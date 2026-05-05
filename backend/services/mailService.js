const axios = require('axios');

// ─── Provider registry ────────────────────────────────────────────────────────
// mail.gw is 100% API-compatible with mail.tm (same endpoints, different base URL).
// By pooling domains from BOTH providers we maximise the domain variety available,
// reducing the chance that any single domain is blocked by a site's blacklist.
const PROVIDERS = [
  { name: 'mail.gw', base: 'https://api.mail.gw' },  // 5 domains — listed first: more variety
  { name: 'mail.tm', base: 'https://api.mail.tm' },   // 1 domain  — good fallback
];

// Build one axios client per provider (same config, different baseURL)
const providerClients = PROVIDERS.map(p =>
  axios.create({ baseURL: p.base, timeout: 12000, headers: { 'Content-Type': 'application/json' } })
);

// ─── Retry with exponential backoff ──────────────────────────────────────────
async function withRetry(fn, retries = 3, baseDelay = 600) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.response?.status;
      if ((status === 429 || status >= 500) && i < retries) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`[mailService] ${status} — retrying in ${delay}ms (attempt ${i + 1})`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Kept for passwords and internal use
const randomString = (len = 10) =>
  Math.random().toString(36).substring(2, 2 + len);

// Human-like username patterns: james.riley84 · carter_morgan21 · alex.brooks57
// These pass pattern-based heuristic filters far better than random junk strings.
const FIRST_NAMES = [
  'alex','blake','casey','dana','drew','eden','finn','gray','harper','indie',
  'jamie','jordan','kai','lane','morgan','noel','ocean','parker','quinn','reese',
  'riley','sage','skyler','taylor','terry','tyler','val','winter','avery','charlie',
  'james','emma','liam','olivia','noah','ava','ethan','sophia','mason','isabella',
  'william','mia','logan','amelia','benjamin','elijah','evelyn','lucas','abigail',
  'oliver','ella','aiden','scarlett','jackson','grace','sebastian','chloe','mateo','lily',
  'carter','anna','jayden','natalie','wyatt','camila','owen','hannah','gabriel','stella',
  'asher','penelope','leo','layla','julian','savannah','landon','addison','nathan','leah',
];
const LAST_NAMES = [
  'smith','jones','brown','taylor','miller','wilson','moore','anderson','jackson','white',
  'harris','martin','garcia','martinez','robinson','clark','rodriguez','lewis','lee','walker',
  'hall','allen','young','hernandez','king','wright','lopez','hill','scott','green',
  'adams','baker','gonzalez','nelson','carter','mitchell','perez','roberts','turner','phillips',
  'campbell','parker','evans','edwards','collins','stewart','sanchez','morris','rogers','reed',
  'cook','morgan','bell','murphy','bailey','rivera','cooper','richardson','cox','howard',
  'ward','brooks','watson','kelly','sanders','price','bennett','wood','barnes','ross',
];

function humanUsername() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last  = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const num   = String(Math.floor(Math.random() * 90) + 10); // two-digit suffix
  const sep   = Math.random() < 0.75 ? '.' : '_';
  return `${first}${sep}${last}${num}`;
}

// ─── Domain pool cache ────────────────────────────────────────────────────────
// Each entry: { domain: string, client: AxiosInstance, provider: string }
// TTL-cached for 5 minutes so we don't hammer the API on every email creation.
let _poolCache     = [];      // cached domain pool
let _poolFetchedAt = 0;       // timestamp of last successful full fetch
const POOL_TTL     = 5 * 60 * 1000; // 5 minutes
let _cursor        = 0;       // round-robin cursor across the pool

async function _fetchPoolFromProvider(client, providerName) {
  const domains = [];
  // Follow hydra pagination up to 10 pages (safety cap)
  for (let page = 1; page <= 10; page++) {
    try {
      const { data } = await client.get(`/domains?page=${page}`);
      const members  = (data['hydra:member'] || []).filter(d => d.isActive !== false);
      if (!members.length) break;
      members.forEach(d => domains.push({ domain: d.domain, client, provider: providerName }));
      const total = data['hydra:totalItems'] || 0;
      if (domains.length >= total) break;
    } catch (e) {
      console.warn(`[mailService] Failed to fetch page ${page} from ${providerName}:`, e.message);
      break;
    }
  }
  return domains;
}

async function _buildPool() {
  const now = Date.now();
  if (_poolCache.length > 0 && now - _poolFetchedAt < POOL_TTL) {
    return _poolCache; // serve from cache
  }

  // Fetch from all providers in parallel, collect results
  const results = await Promise.allSettled(
    PROVIDERS.map((p, i) => _fetchPoolFromProvider(providerClients[i], p.name))
  );

  const pool = [];
  results.forEach(r => {
    if (r.status === 'fulfilled') pool.push(...r.value);
  });

  if (pool.length === 0) {
    throw new Error('No domains available from any provider');
  }

  // Shuffle the pool so we don't always hit provider #1 first
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  _poolCache     = pool;
  _poolFetchedAt = now;
  _cursor        = 0; // reset cursor after rebuild
  console.log(`[mailService] Domain pool rebuilt: ${pool.map(d => d.domain).join(', ')}`);
  return pool;
}

// ─── PUBLIC: getDomains ───────────────────────────────────────────────────────
// Returns domains in mail.tm hydra format so the existing route + frontend work
// exactly as before (the domain selector dropdown shows all available domains).
async function getDomains() {
  const pool = await _buildPool();
  // Deduplicate in case both providers share a domain (unlikely but safe)
  const seen = new Set();
  return pool
    .filter(entry => {
      if (seen.has(entry.domain)) return false;
      seen.add(entry.domain);
      return true;
    })
    .map((entry, idx) => ({
      id:        `pool-${idx}`,
      domain:    entry.domain,
      isActive:  true,
      provider:  entry.provider,
    }));
}

// ─── PUBLIC: createAccount ────────────────────────────────────────────────────
// Tries every domain in the pool (round-robin order, starting from cursor).
// On any per-domain failure it silently moves to the next — user never sees it.
// Accepts an optional `selectedDomain` string for manual domain switching.
async function createAccount(selectedDomain) {
  const pool = await _buildPool();
  if (!pool.length) throw new Error('No domains available');

  // Build attempt list: preferred domain first, then round-robin through the rest
  let attempts;
  if (selectedDomain) {
    const preferred = pool.filter(e => e.domain === selectedDomain);
    const rest      = pool.filter(e => e.domain !== selectedDomain);
    attempts = [...preferred, ...rest];
  } else {
    const start = _cursor % pool.length;
    attempts    = [...pool.slice(start), ...pool.slice(0, start)];
    _cursor     = (start + 1) % pool.length; // advance for next call
  }

  let lastErr;
  for (const entry of attempts) {
    if (!entry?.domain) continue;
    const username = humanUsername();
    const address  = `${username}@${entry.domain}`;
    const password = randomString(16);

    try {
      const result = await withRetry(async () => {
        await entry.client.post('/accounts', { address, password });
        const { data: tokenData } = await entry.client.post('/token', { address, password });
        return { address, password, token: tokenData.token, id: tokenData.id, _provider: entry.provider };
      }, 2, 400);
      console.log(`[mailService] Created account on ${entry.provider}: ${address}`);
      return result;
    } catch (err) {
      const status = err.response?.status;
      console.warn(`[mailService] ${entry.provider}/${entry.domain} failed (${status}) — trying next`);
      lastErr = err;
      await new Promise(r => setTimeout(r, 250));
    }
  }

  throw lastErr || new Error('Failed to create account on any available domain');
}

// ─── Resolve the correct API client for an existing address ──────────────────
// When restoring a session we need to call the right provider's /token endpoint.
// Strategy: try mail.gw first (more domains), then mail.tm as fallback.
async function _clientForAddress(address) {
  // Try both and return whichever responds first (already in pool order)
  return providerClients; // caller will try each in sequence
}

// ─── PUBLIC: getToken (restore session) ──────────────────────────────────────
// Tries each provider in order until one returns a valid token.
async function getToken(address, password) {
  let lastErr;
  for (const pc of providerClients) {
    try {
      const { data } = await withRetry(() => pc.post('/token', { address, password }), 2, 400);
      return { token: data.token, id: data.id };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// ─── PUBLIC: getMessages ─────────────────────────────────────────────────────
// The token is provider-scoped; we try all providers transparently.
async function getMessages(token) {
  let lastErr;
  for (const pc of providerClients) {
    try {
      const { data } = await withRetry(() =>
        pc.get('/messages?page=1', { headers: { Authorization: `Bearer ${token}` } }), 2, 400);
      return data['hydra:member'] || [];
    } catch (err) {
      lastErr = err;
      if (err.response?.status === 401) continue; // wrong provider for this token
    }
  }
  throw lastErr;
}

// ─── PUBLIC: getMessage ───────────────────────────────────────────────────────
async function getMessage(token, id) {
  let lastErr;
  for (const pc of providerClients) {
    try {
      const { data } = await withRetry(() =>
        pc.get(`/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } }), 2, 400);
      return data;
    } catch (err) {
      lastErr = err;
      if (err.response?.status === 401) continue;
    }
  }
  throw lastErr;
}

// ─── PUBLIC: deleteMessage ───────────────────────────────────────────────────
async function deleteMessage(token, id) {
  let lastErr;
  for (const pc of providerClients) {
    try {
      await pc.delete(`/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return;
    } catch (err) {
      lastErr = err;
      if (err.response?.status === 401) continue;
    }
  }
  if (lastErr) throw lastErr;
}

// ─── PUBLIC: deleteAccount ───────────────────────────────────────────────────
async function deleteAccount(token, accountId) {
  let lastErr;
  for (const pc of providerClients) {
    try {
      await pc.delete(`/accounts/${accountId}`, { headers: { Authorization: `Bearer ${token}` } });
      return;
    } catch (err) {
      lastErr = err;
      if (err.response?.status === 401) continue;
    }
  }
  if (lastErr) throw lastErr;
}

module.exports = {
  getDomains,
  createAccount,
  getToken,
  getMessages,
  getMessage,
  deleteMessage,
  deleteAccount,
};
