// Minimal RSS/Atom reader with no external dependencies.

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&nbsp;': ' ', '&hellip;': '…', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”', '&ndash;': '–', '&mdash;': '—',
};

function decode(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

function clean(raw) {
  if (!raw) return '';
  let t = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  t = decode(t);
  t = t.replace(/<[^>]*>/g, ' '); // strip HTML
  t = decode(t);
  return t.replace(/\s+/g, ' ').trim();
}

function pick(block, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  const m = block.match(re);
  return m ? m[1] : '';
}

function pickLink(block) {
  // RSS: <link>url</link>   Atom: <link href="url" />
  const rss = pick(block, 'link');
  if (rss && /^\s*(<!\[CDATA\[)?\s*https?:/i.test(rss)) return clean(rss);
  const atom = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (atom) return decode(atom[1]);
  const guid = clean(pick(block, 'guid'));
  return /^https?:/i.test(guid) ? guid : '';
}

function shorten(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : max) + '…';
}

// Only http(s) links are accepted: avoids dangerous schemes such as javascript:
function safeUrl(u) {
  return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : '';
}

function parseFeed(xml) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  const items = [];
  for (const b of blocks) {
    const title = clean(pick(b, 'title'));
    const link = safeUrl(pickLink(b));
    if (!title || !link) continue;
    const dateRaw = clean(pick(b, 'pubDate') || pick(b, 'dc:date') || pick(b, 'published') || pick(b, 'updated'));
    const time = Date.parse(dateRaw);
    const summary = shorten(clean(pick(b, 'description') || pick(b, 'summary') || pick(b, 'content')), 220);
    items.push({
      title,
      link,
      summary: summary === title ? '' : summary,
      date: Number.isNaN(time) ? null : new Date(time).toISOString(),
    });
  }
  return items;
}

module.exports = { parseFeed };
