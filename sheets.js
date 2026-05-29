// Vercel Serverless Function — proxies Google Sheets CSV (avoids browser CORS)
// Usage: /api/sheets?which=bases  or  /api/sheets?which=sobreposicoes

const URLS = {
  bases: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRclg1tbeUqXgXDoAv9pstURctAHfxw1bpmeT-kz914PfANfxG3WsPNDOo_bysUPtNPj0o7p6oRsvDh/pub?gid=0&single=true&output=csv',
  sobreposicoes: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRclg1tbeUqXgXDoAv9pstURctAHfxw1bpmeT-kz914PfANfxG3WsPNDOo_bysUPtNPj0o7p6oRsvDh/pub?gid=2039098280&single=true&output=csv'
};

export default async function handler(req, res) {
  const which = req.query.which;
  const url = URLS[which];

  if (!url) {
    res.status(400).json({ error: 'Parâmetro "which" inválido. Use bases ou sobreposicoes.' });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).json({ error: 'Falha ao buscar a planilha no Google.' });
      return;
    }
    const csv = await response.text();

    // Cache for 60s at the edge to reduce load; data still refreshes
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno ao buscar a planilha.' });
  }
}
