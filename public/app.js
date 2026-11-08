// Economy Today UI logic.

const $ = (id) => document.getElementById(id);
const els = {
  list: $('list'), countries: $('countries'), search: $('search'),
  days: $('days'), meta: $('meta'), refresh: $('refresh'), banner: $('demo-banner'),
};

// State is stored on the device to remember your last selection.
const saved = (() => { try { return JSON.parse(localStorage.getItem('eh-state')) || {}; } catch { return {}; } })();
const state = { country: saved.country || 'ALL', days: saved.days ?? '3', q: '' };
els.days.value = String(state.days);

function persist() {
  try { localStorage.setItem('eh-state', JSON.stringify({ country: state.country, days: state.days })); } catch {}
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

let countryList = [];
const flagOf = (code) => (countryList.find((c) => c.code === code) || {}).flag || '';
const nameOf = (code) => (countryList.find((c) => c.code === code) || {}).name || code;

function renderChips() {
  const all = [{ code: 'ALL', name: 'All', flag: '🌐' }, ...countryList];
  els.countries.innerHTML = all
    .map((c) => `<button class="chip ${c.code === state.country ? 'active' : ''}" data-code="${c.code}">${c.flag} ${esc(c.name)}</button>`)
    .join('');
}

async function loadCountries() {
  try {
    countryList = await (await fetch('/api/countries')).json();
  } catch { countryList = []; }
  if (state.country !== 'ALL' && !countryList.some((c) => c.code === state.country)) state.country = 'ALL';
  renderChips();
}

async function loadNews() {
  els.list.innerHTML = '<div class="skeleton"></div>'.repeat(4);
  const params = new URLSearchParams({ country: state.country, days: state.days, q: state.q });
  try {
    const res = await fetch('/api/news?' + params);
    const data = await res.json();
    els.banner.hidden = !data.demo;
    els.meta.textContent = data.updatedAt ? `${data.total} articles · updated ${timeAgo(data.updatedAt)}` : '';
    if (!data.articles.length) {
      els.list.innerHTML = '<div class="empty">No articles match these filters.<br>Try another period or country.</div>';
      return;
    }
    els.list.innerHTML = data.articles.map((a) => `
      <a class="card" href="${esc(a.link)}" target="_blank" rel="noopener noreferrer">
        <div class="tag"><b>${flagOf(a.country)} ${esc(nameOf(a.country))}</b><span>${esc(a.source)}</span><span>· ${timeAgo(a.date)}</span></div>
        <h2>${esc(a.title)}</h2>
        ${a.summary ? `<p>${esc(a.summary)}</p>` : ''}
      </a>`).join('');
  } catch {
    els.list.innerHTML = '<div class="empty">Could not load. Check your connection and try again.</div>';
  }
}

els.countries.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  state.country = btn.dataset.code;
  persist(); renderChips(); loadNews();
});

els.days.addEventListener('change', () => { state.days = els.days.value; persist(); loadNews(); });

let t;
els.search.addEventListener('input', () => {
  clearTimeout(t);
  t = setTimeout(() => { state.q = els.search.value.trim(); loadNews(); }, 300);
});

els.refresh.addEventListener('click', async () => {
  els.refresh.classList.add('spin');
  await loadCountries();
  await loadNews();
  els.refresh.classList.remove('spin');
});

(async function init() {
  await loadCountries();
  await loadNews();
})();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
