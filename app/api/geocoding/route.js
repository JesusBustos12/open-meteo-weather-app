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
    // Pedimos 3 resultados directos de Open-Meteo
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=3&language=${lang}&format=json`;

    const response = await fetch(openMeteoUrl);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo respondió con estado ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results) {
      return NextResponse.json({ results: [] });
    }

    logger.info('Geocoding Success', { count: data.results.length });
    return NextResponse.json({ results: data.results });

  } catch (error) {
    logger.error('Proxy Geocoding Error', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error al buscar la ciudad' }, { status: 500 });
  }
}
