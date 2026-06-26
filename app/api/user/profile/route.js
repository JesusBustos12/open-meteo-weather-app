import { NextResponse } from 'next/server';
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

    if (!isValidName(name) || !isValidEmail(email)) {
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

    const [result] = await pool.execute(query, params);
    
    // DEBUG: Imprimir en servidor para ver si de verdad afectó a la base de datos
    console.log("UPDATE result:", result);
    if (result.affectedRows === 0) {
      console.warn("WARNING: El UPDATE no afectó a ninguna fila. El ID del usuario podría no existir o los datos eran idénticos.");
    }

    return NextResponse.json({ 
      success: true, 
      user: { name, email: email.toLowerCase(), avatar_url } 
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'El email ya está en uso por otro usuario' }, { status: 400 });
    }
    logger.error('Profile Update Error', { userId: req.userId, error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error del servidor al actualizar perfil' }, { status: 500 });
  }
}

export async function PUT(req, ...args) {
  return withAuth(handler)(req, ...args);
}
