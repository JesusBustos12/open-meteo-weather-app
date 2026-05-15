export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitud y Longitud son requeridas' });
    }

    // Pasar todos los query params a Open-Meteo
    const params = new URLSearchParams(req.query);
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Open-Meteo respondió con estado ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Weather error:', error.message);
    return res.status(500).json({ error: 'Error al obtener datos meteorológicos' });
  }
}
