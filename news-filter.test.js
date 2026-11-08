const test = require('node:test');
const assert = require('node:assert/strict');
const { isEconomicArticle } = require('./news-filter');

test('keeps economic headlines across source languages', () => {
  for (const title of [
    'El riesgo país pasó los 900 puntos y las acciones argentinas se hundieron',
    'Las ventas minoristas pyme cayeron 1,6% interanual',
    'Plazo fijo en dólares: cuánto se puede obtener al invertir',
    'El BCE mantiene los tipos de interés',
    'US inflation falls as Federal Reserve considers interest rates',
    'Beijing property stimulus falls short',
    'Les prix de l’électricité pèseront sur l’inflation',
    'La croissance ralentit et le chômage augmente',
    'German industrial output and export outlook',
    'Japan wages rise as yen weakens',
  ]) assert.equal(isEconomicArticle({ title }), true, title);
});

test('rejects unrelated live-feed examples even with economic summaries', () => {
  for (const title of [
    'LIVE: Atletico Madrid vs Barcelona – La Liga',
    'Photos: Diwali celebrations light up India',
    'Train crash kills seven, injures dozens near Cairo',
    'Tenerife’s Jesus De Miguel honoured in tearful tribute by teammates, fans',
    'Jerusalem Daily: Eisenkot picked over Netanyahu to form government',
    'How a Duck Named Olivia Helped Pass D.C.’s Foie Gras Ban',
    'He spent $50,000 on Labubus but now the craze is dying',
    'Cuánto cobra el papa y qué beneficios económicos recibe',
    'Your horoscope: a financial surprise is coming',
  ]) assert.equal(isEconomicArticle({ title, summary: 'economy banks inflation' }), false, title);
});

test('does not accept incidental substrings or missing titles', () => {
  for (const title of ['', undefined, 'The tradeoff in a football match', 'An acclaimed band announces a tour']) {
    assert.equal(isEconomicArticle({ title }), false);
  }
});
