import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { withAuth } from '../../../../lib/withAuth';
import { logger } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

async function handler(req) {
  try {
    const userId = req.userId;

    const [uRows] = await pool.query('SELECT name, email, avatar_url FROM users WHERE id = ?', [userId]);
    const [pRows] = await pool.query('SELECT theme, language FROM user_preferences WHERE user_id = ?', [userId]);
    const [cRows] = await pool.query('SELECT id, name, latitude, longitude FROM favorite_cities WHERE user_id = ?', [userId]);

    return NextResponse.json({
      success: true,
      user: uRows[0],
      preferences: pRows[0] || null,
      cities: cRows
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    logger.error('Sync Error', { userId: req.userId, error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error al sincronizar datos' }, { status: 500 });
  }
}

export async function GET(req, ...args) {
  return withAuth(handler)(req, ...args);
}
