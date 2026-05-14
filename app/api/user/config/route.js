import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { withAuth } from '../../../../lib/withAuth';
import { logger } from '../../../../lib/logger';

async function handler(req) {
  try {
    const userId = req.userId;
    const { theme, language } = await req.json();

    // Normalizar undefined a null para MySQL
    const normalizedTheme = theme !== undefined ? theme : null;
    const normalizedLanguage = language !== undefined ? language : null;

    if (normalizedTheme === null && normalizedLanguage === null) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
    }

    await pool.execute(
      'UPDATE user_preferences SET theme = COALESCE(?, theme), language = COALESCE(?, language) WHERE user_id = ?',
      [normalizedTheme, normalizedLanguage, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Update Config Error', { userId: req.userId, error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}

export async function PUT(req, ...args) {
  return withAuth(handler)(req, ...args);
}
