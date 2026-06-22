// Vercel Serverless Function — proxies Google Sheets CSV (avoids browser CORS)
// Usage: /api/sheets?which=bases | sobreposicoes | bases_metricas | expectativa_metricas

const BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRclg1tbeUqXgXDoAv9pstURctAHfxw1bpmeT-kz914PfANfxG3WsPNDOo_bysUPtNPj0o7p6oRsvDh/pub?single=true&output=csv';

const URLS = {
  bases:               BASE + '&gid=0',
  sobreposicoes:       BASE + '&gid=2039098280',
  bases_metricas:      BASE + '&gid=1950600859',
  expectativa_metricas: BASE + '&gid=1146702784'
};

export default async function handler(req, res) {
  const which = req.query.which;
  const url = URLS[which];

  if (!url) {
    res.status(400).json({ error: 'Parâmetro "which" inválido. Use: bases, sobreposicoes, bases_metricas ou expectativa_metricas.' });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).json({ error: 'Falha ao buscar a planilha no Google.' });
      return;
    }
    const csv = await response.text();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno ao buscar a planilha.' });
  }
}
