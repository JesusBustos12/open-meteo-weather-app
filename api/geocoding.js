export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, limit = '8', language = 'es' } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Nombre de ciudad requerido' });
    }

    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=15&language=${language}&format=json`;
    const response = await fetch(openMeteoUrl);

    if (!response.ok) {
      throw new Error(`Open-Meteo respondió con estado ${response.status}`);
    }

    const data = await response.json();

    if (!data.results) {
      return res.status(200).json({ results: [] });
    }

    // Algoritmo de Scoring para mejorar relevancia
    const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNorm = normalize(name);

    const scoredResults = data.results.map(item => {
      let score = 0;
      const nameNorm = normalize(item.name);

      if (item.population) {
        score += Math.log10(item.population) * 25;
      }

      const f = item.feature_code || '';
      if (f === 'PCLI') score += 2000;
      else if (f === 'PPLC') score += 1000;
      else if (f === 'PPLA') score += 500;
      else if (f.startsWith('PPLA')) score += 200;

      if (nameNorm === queryNorm) {
        score += 500;
      } else if (nameNorm.includes(queryNorm)) {
        score += 100;
      }

      return { ...item, _score: score };
    });

    const finalResults = scoredResults
      .sort((a, b) => b._score - a._score)
      .slice(0, 1);

    return res.status(200).json({ results: finalResults });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return res.status(500).json({ error: 'Error al buscar la ciudad' });
  }
}
