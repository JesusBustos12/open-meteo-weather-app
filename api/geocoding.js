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

    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=3&language=${language}&format=json`;
    const response = await fetch(openMeteoUrl);

    if (!response.ok) {
      throw new Error(`Open-Meteo respondió con estado ${response.status}`);
    }

    const data = await response.json();

    if (!data.results) {
      return res.status(200).json({ results: [] });
    }

    return res.status(200).json({ results: data.results });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return res.status(500).json({ error: 'Error al buscar la ciudad' });
  }
}
