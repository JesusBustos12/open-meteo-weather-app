import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { withAuth } from '../../../../lib/withAuth';
import { logger } from '../../../../lib/logger';

async function handler(req) {
  try {
    const userId = req.userId;
    const { name, latitude, longitude } = await req.json();

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Datos de la ciudad incompletos' }, { status: 400 });
    }

    await pool.execute(
      'INSERT INTO favorite_cities (user_id, name, latitude, longitude) VALUES (?, ?, ?, ?)',
      [userId, name, latitude, longitude]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'La ciudad ya está en tus favoritos' }, { status: 400 });
    }
    logger.error('Add City Error', { userId: req.userId, error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error al guardar ciudad' }, { status: 500 });
  }
}

export async function POST(req, ...args) {
  return withAuth(handler)(req, ...args);
}
