// Economy Today server. No dependencies: Node 18+ only.
// Usage: node server.js   (default port 3000, or the PORT variable)

const http = require('http');
const fs = require('fs');
const path = require('path');
const { COUNTRIES, FEEDS } = require('./feeds');
const { parseFeed } = require('./rss');
const { isEconomicArticle } = require('./news-filter');

const PORT = process.env.PORT || 3000;
const REFRESH_MS = 30 * 60 * 1000; // refresh every 30 minutes
const FETCH_TIMEOUT_MS = 8000;
const MAX_ITEMS_PER_FEED = 25;
const MAX_FEED_BYTES = 3 * 1024 * 1024; // ignore feeds larger than 3 MB
const PUBLIC_DIR = path.join(__dirname, 'public');
const CACHE_FILE = path.join(__dirname, 'data', 'cache.json');
const SAMPLE_FILE = path.join(__dirname, 'data', 'sample.json');

let state = { articles: [], updatedAt: null, demo: false, feedStatus: [] };

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

async function fetchFeed(feed) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'EconomiaHoy/1.0 (lector RSS personal)', Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (Number(res.headers.get('content-length')) > MAX_FEED_BYTES) throw new Error('feed demasiado grande');
    const body = await res.text();
    if (body.length > MAX_FEED_BYTES) throw new Error('feed demasiado grande');
    const items = parseFeed(body).filter(isEconomicArticle).slice(0, MAX_ITEMS_PER_FEED);
    return {
      ok: true,
      articles: items.map((it) => ({ ...it, country: feed.country, source: feed.source })),
    };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message, articles: [] };
  } finally {
    clearTimeout(timer);
  }
}

async function refresh() {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  const feedStatus = FEEDS.map((f, i) => ({
    source: f.source, country: f.country, ok: results[i].ok, count: results[i].articles.length, error: results[i].error || null,
  }));
  const seen = new Set();
  const articles = results
    .flatMap((r) => r.articles)
    .filter((a) => (seen.has(a.link) ? false : (seen.add(a.link), true)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (articles.length > 0) {
    state = { articles, updatedAt: new Date().toISOString(), demo: false, feedStatus };
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(state));
    console.log(`[${new Date().toISOString()}] ${articles.length} articles from ${feedStatus.filter((f) => f.ok).length}/${FEEDS.length} sources`);
  } else {
    console.warn('Could not download any feed. Keeping the cache or the sample data.');
    state.feedStatus = feedStatus;
    if (state.articles.length === 0) loadFallback();
  }
}

function loadFallback() {
  const cached = readJson(CACHE_FILE);
  if (cached && cached.articles && cached.articles.length) {
    state = { ...cached, feedStatus: state.feedStatus };
    return;
  }
  const sample = readJson(SAMPLE_FILE);
  if (sample) state = { articles: sample.articles, updatedAt: new Date().toISOString(), demo: true, feedStatus: state.feedStatus };
}

function apiNews(url) {
  const country = (url.searchParams.get('country') || '').toUpperCase();
  const q = (url.searchParams.get('q') || '').toLowerCase().trim();
  const days = Number(url.searchParams.get('days')) || 0;
  const limit = Math.min(Number(url.searchParams.get('limit')) || 60, 200);
  const since = days ? Date.now() - days * 86400000 : 0;

  let list = state.articles.filter(isEconomicArticle);
  if (country && country !== 'ALL') list = list.filter((a) => a.country === country);
  if (since) list = list.filter((a) => a.date && Date.parse(a.date) >= since);
  if (q) list = list.filter((a) => (a.title + ' ' + a.summary).toLowerCase().includes(q));

  return { total: list.length, demo: state.demo, updatedAt: state.updatedAt, articles: list.slice(0, limit) };
}

function apiCountries() {
  const counts = {};
  for (const a of state.articles.filter(isEconomicArticle)) counts[a.country] = (counts[a.country] || 0) + 1;
  return Object.entries(COUNTRIES)
    .map(([code, c]) => ({ code, name: c.name, flag: c.flag, count: counts[code] || 0 }))
    .filter((c) => c.count > 0);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

// Security headers on every response.
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function sendText(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
  res.end(text);
}

function sendJson(res, data) {
  res.writeHead(200, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-cache', ...SECURITY_HEADERS });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { return sendText(res, 400, 'Bad request'); }
  if (rel.includes('\0')) return sendText(res, 400, 'Bad request');
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return sendText(res, 403, 'Forbidden');
  fs.readFile(file, (err, data) => {
    if (err) return sendText(res, 404, 'Not found');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', ...SECURITY_HEADERS });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  try {
    if (req.method !== 'GET') return sendText(res, 405, 'Method not allowed');
    let url;
    try { url = new URL(req.url, 'http://localhost'); } catch { return sendText(res, 400, 'Bad request'); }
    if (url.pathname === '/api/news') return sendJson(res, apiNews(url));
    if (url.pathname === '/api/countries') return sendJson(res, apiCountries());
    if (url.pathname === '/api/status') return sendJson(res, { updatedAt: state.updatedAt, demo: state.demo, feeds: state.feedStatus });
    serveStatic(req, res, url);
  } catch (err) {
    console.error('Request error:', err.message);
    if (!res.headersSent) sendText(res, 500, 'Internal error');
  }
});

// Last resort: an unexpected error should not bring the server down.
process.on('uncaughtException', (err) => console.error('Uncaught error:', err.message));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err && err.message));

loadFallback(); // start with something to show right away
server.listen(PORT, () => console.log(`Economy Today running at http://localhost:${PORT}`));
refresh();
setInterval(refresh, REFRESH_MS);
