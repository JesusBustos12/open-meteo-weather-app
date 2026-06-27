import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import pool from '../../../../lib/db';
import { withAuth } from '../../../../lib/withAuth';
import { isValidEmail, isValidPassword, isValidName } from '../../../../lib/validators';
import { logger } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';


async function handler(req) {
  try {
    const userId = req.userId;
    const { name, email, password, avatar_url } = await req.json();

    console.log('[PROFILE UPDATE] userId:', userId, 'name:', name, 'email:', email, 'hasPassword:', !!(password && password.trim().length > 0), 'hasAvatar:', !!(avatar_url && avatar_url.length > 0), 'avatarLen:', avatar_url?.length || 0);

    if (!isValidName(name) || !isValidEmail(email)) {
      console.log('[PROFILE UPDATE] Validation failed — name valid:', isValidName(name), 'email valid:', isValidEmail(email));
      return NextResponse.json({ error: 'Nombre y email válidos son obligatorios' }, { status: 400 });
    }

    // Normalizar a null para evitar errores en mysql2 si llega undefined
    const normalizedName = name !== undefined ? name : null;
    const normalizedEmail = email !== undefined ? email.toLowerCase() : null;
    const normalizedAvatar = avatar_url !== undefined ? avatar_url : null;

    // 1. Actualizar datos básicos y avatar
    let query = 'UPDATE users SET name = ?, email = ?, avatar_url = ?';
    let params = [normalizedName, normalizedEmail, normalizedAvatar];

    // 2. Si hay password, hashearla e incluirla (si es válida)
    if (password && password.trim().length > 0) {
      if (!isValidPassword(password)) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 10);
      query += ', password_hash = ?';
      params.push(hash);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    const [result] = await pool.query(query, params);
    
    console.log('[PROFILE UPDATE] UPDATE result:', JSON.stringify(result));

    if (result.affectedRows === 0) {
      console.warn('[PROFILE UPDATE] WARNING: 0 rows affected.');
      return NextResponse.json({ error: 'No se encontró el usuario' }, { status: 404 });
    }

    // 3. VERIFICACIÓN: Leer de la BD para confirmar que se guardó
    const [verifyRows] = await pool.query('SELECT name, email, avatar_url FROM users WHERE id = ?', [userId]);
    console.log('[PROFILE UPDATE] VERIFY after update — name:', verifyRows[0]?.name, 'email:', verifyRows[0]?.email, 'avatarLen:', verifyRows[0]?.avatar_url?.length || 0);

    // PURGAR CACHÉ DEL SERVIDOR DE NEXT.JS PARA QUE LA SIGUIENTE LLAMADA A SYNC TRAIGA LO NUEVO
    revalidatePath('/api/user/sync');
    revalidatePath('/api/auth/login');

    return NextResponse.json({ 
      success: true, 
      user: { name: verifyRows[0]?.name, email: verifyRows[0]?.email, avatar_url: verifyRows[0]?.avatar_url }
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'El email ya está en uso por otro usuario' }, { status: 400 });
    }
    logger.error('Profile Update Error', { userId: req.userId, error: error.message, stack: error.stack });
    console.error('[PROFILE UPDATE] CRITICAL ERROR:', error.message, error.stack);
    return NextResponse.json({ error: 'Error del servidor al actualizar perfil' }, { status: 500 });
  }
}

export async function PUT(req, ...args) {
  return withAuth(handler)(req, ...args);
}
