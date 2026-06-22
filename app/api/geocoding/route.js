import { NextResponse } from 'next/server';
import { logger } from '../../../lib/logger';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const limit = searchParams.get('limit') || '8';
    const lang = searchParams.get('language') || 'es';
    
    if (!name) {
      return NextResponse.json({ error: 'Nombre de ciudad requerido' }, { status: 400 });
    }

    logger.info('Geocoding Request', { name, lang });

    // --- INTEGRACIÓN CON OPEN-METEO + SCORING DE RELEVANCIA ---
    // Pedimos 15 resultados para poder filtrar y ordenar inteligentemente
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=15&language=${lang}&format=json`;

    const response = await fetch(openMeteoUrl);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo respondió con estado ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results) {
      return NextResponse.json({ results: [] });
    }

    // Algoritmo de Scoring para mejorar la relevancia (Estilo Google Maps)
    const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNorm = normalize(name);

    const scoredResults = data.results.map(item => {
      let score = 0;
      const nameNorm = normalize(item.name);
      
      // 1. Puntos por población (escala logarítmica pesiva)
      if (item.population) {
        score += Math.log10(item.population) * 100;
      }

      // 2. Puntos por tipo de entidad (GeoNames codes)
      const f = item.feature_code || '';
      if (f === 'PCLI') score += 2000;
      else if (f === 'PPLC') score += 1500;
      else if (f === 'ADM1') score += 1000;
      else if (f === 'PPLA') score += 800;
      else if (f === 'ADM2' || f === 'ADM3') score += 500;
      else if (f.startsWith('PPLA')) score += 400;
      else if (f.startsWith('PPL')) score += 300;

      // 3. Puntos por coincidencia de nombre (normalizado)
      if (nameNorm === queryNorm) {
        score += 500;
      } else if (nameNorm.includes(queryNorm)) {
        score += 100;
      }

      return { ...item, _score: score };
    });

    // Ordenar por puntuación descendente y devolver solo las 2 mejores opciones
    const finalResults = scoredResults
      .sort((a, b) => b._score - a._score)
      .slice(0, 2);

    logger.info('Geocoding Success', { count: finalResults.length });
    return NextResponse.json({ results: finalResults });

  } catch (error) {
    logger.error('Proxy Geocoding Error', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error al buscar la ciudad' }, { status: 500 });
  }
}
