import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/withAuth';
import { logger } from '../../../../../lib/logger';

async function handler(req, { params }) {
  try {
    const userId = req.userId;
    const { name } = await params;

    if (!name) {
      return NextResponse.json({ error: 'Nombre de la ciudad es requerido' }, { status: 400 });
    }

    await pool.query(
      'DELETE FROM favorite_cities WHERE user_id = ? AND name = ?',
      [userId, name]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Delete City Error', { userId: req.userId, cityName: req.params?.name, error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error al eliminar ciudad' }, { status: 500 });
  }
}

export async function DELETE(req, ...args) {
  return withAuth(handler)(req, ...args);
}
