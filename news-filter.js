// Conservative headline filter: a business feed can still contain unrelated stories.
// Match the headline, rather than incidental words in the summary or URL.
function normalize(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const ECONOMIC_TOPIC = /\b(?:econom\w*|macroeconom\w*|inflaci\w*|inflation\w*|deflaci\w*|deflation\w*|pib|gdp|pbi|recesi\w*|recession\w*|fiscal\w*|impuest\w*|tributari\w*|tax(?:es|ation)?|arancel\w*|tariff\w*|presupuest\w*|budget\w*|deficit\w*|deuda\w*|debt\w*|bonos?|bonds?|tesoro|treasury|treasuries|dolar\w*|dollars?|divisas?|currenc\w*|euro|euros|yuan|yen|sterling|forex|bursatil\w*|bolsas?|bourses?|stocks?|equities|acciones|accionistas?|ibex|nasdaq|merval|s&p|financi\w*|financ\w*|banc\w*|banks?|banking|banca\w*|credit\w*|creditici\w*|hipotec\w*|mortgages?|inversi\w*|invertir|invest\w*|ahorro\w*|plazo fijo|riesgo pais|reservas|bcra|bce|ecb|fed|federal reserve|interest rates?|tasas? de interes|tipos? de interes|taux d.interet|central banks?|bancos? central\w*|banque centrale|comercio|trade|export\w*|import\w*|industr\w*|manufactur\w*|produccion|production|consumo|consum\w*|retail|minoristas?|ventas|sales|salari\w*|sueldos?|wages?|payroll\w*|empleo|desempleo|unemployment|employment|laboral\w*|pension\w*|jubilaci\w*|petrole\w*|oil|crude|gas natural|natural gas|gnl|lng|commodit\w*|soja|soybean\w*|trigo|wheat|mineria|mining|cobre|copper|litio|lithium|bitcoin|crypto\w*|cripto\w*|inmobiliari\w*|housing|property|vivienda\w*|alquiler\w*|rentals?|logement\w*|immobilier|chomage|croissance|emploi\w*|entreprises?|wirtschaft\w*|konjunktur\w*|zinsen|arbeitslos\w*|handel\w*|business|empresas?|empresari\w*|pymes?|smes?|profits?|earnings|beneficios? empresariales|ganancias|facturaci\w*|quiebra\w*|bankrupt\w*)\b/i;

// These recurring entertainment/service stories can mention money without
// providing economic reporting. Keep the exclusion deliberately specific.
const OFF_TOPIC = /\b(?:horoscop\w*|zodiac\w*|celebrity|celebrities|famosos?|recetas?|recipes?|foie gras|labubus?|legend of zelda|la liga|world cup|champions league|premier league|football match|partido de futbol|cuanto (?:cobra|gana) el papa)\b/i;

function isEconomicArticle(article) {
  const title = normalize(article.title);
  return !OFF_TOPIC.test(title) && ECONOMIC_TOPIC.test(title);
}

module.exports = { isEconomicArticle };
