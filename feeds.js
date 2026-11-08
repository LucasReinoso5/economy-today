// Economic news RSS sources by country.
// To add a country or an outlet, just add a line here.
// If a feed stops working, the app simply ignores it.

const COUNTRIES = {
  ES: { name: 'Spain', flag: '🇪🇸' },
  AR: { name: 'Argentina', flag: '🇦🇷' },
  MX: { name: 'Mexico', flag: '🇲🇽' },
  US: { name: 'United States', flag: '🇺🇸' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  FR: { name: 'France', flag: '🇫🇷' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  CN: { name: 'China', flag: '🇨🇳' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  WORLD: { name: 'World', flag: '🌍' },
};

const FEEDS = [
  { country: 'ES', source: 'Expansión', url: 'https://e00-expansion.uecdn.es/rss/economia.xml' },
  { country: 'ES', source: 'Cinco Días', url: 'https://cincodias.elpais.com/rss/cincodias/portada.xml' },
  { country: 'ES', source: 'El País Economía', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada' },

  { country: 'AR', source: 'Ámbito', url: 'https://www.ambito.com/rss/pages/economia.xml' },
  { country: 'AR', source: 'Infobae Economía', url: 'https://www.infobae.com/arc/outboundfeeds/rss/category/economia/' },

  { country: 'MX', source: 'El Economista', url: 'https://www.eleconomista.com.mx/rss/economia' },

  { country: 'US', source: 'NYT Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml' },
  { country: 'US', source: 'CNBC Economy', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258' },

  { country: 'GB', source: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },

  { country: 'FR', source: 'Le Monde Économie', url: 'https://www.lemonde.fr/economie/rss_full.xml' },

  { country: 'DE', source: 'DW Business', url: 'https://rss.dw.com/rdf/rss-en-bus' },

  { country: 'CN', source: 'SCMP Economy', url: 'https://www.scmp.com/rss/92/feed' },

  { country: 'JP', source: 'Japan Times Business', url: 'https://www.japantimes.co.jp/news_category/business/feed/' },

  { country: 'WORLD', source: 'The Guardian Business', url: 'https://www.theguardian.com/business/rss' },
];

module.exports = { COUNTRIES, FEEDS };
