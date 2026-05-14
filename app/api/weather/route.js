import { NextResponse } from 'next/server';
import { logger } from '../../../lib/logger';
import { getCached, setCache } from '../../../lib/cache';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    
    logger.info('Weather Request', { latitude, longitude });
    
    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitud y Longitud son requeridas' }, { status: 400 });
    }

    const cacheKey = `weather_${latitude}_${longitude}_${searchParams.toString()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Weather Cache Hit', { latitude, longitude });
      return NextResponse.json(cached);
    }

    // Construir los parámetros para enviar a Open-Meteo
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo respondió con estado ${response.status}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    logger.info('Weather Success', { source: 'Open-Meteo' });
    return NextResponse.json(data);

  } catch (error) {
    logger.error('Proxy Weather Error', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error al obtener datos meteorológicos' }, { status: 500 });
  }
}
