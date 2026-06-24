import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../../../lib/db';
import { rateLimit } from '../../../../lib/rateLimit';
import { headers } from 'next/headers';
import { isValidEmail, isValidPassword, isValidName } from '../../../../lib/validators';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

export async function POST(req) {
  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || 'unknown';

    if (!limiter(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espere 15 minutos.' },
        { status: 429 }
      );
    }

    const { name, email, password, avatar } = await req.json();

    if (!isValidName(name) || !isValidEmail(email) || !isValidPassword(password)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase(), hash, avatar || '']
    );

    const userId = result.insertId;
    await pool.execute('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);

    const response = NextResponse.json({ success: true, user: { name, email, avatar } }, { status: 201 });
    return response;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'El email ya existe' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error en el servidor', details: error.message }, { status: 500 });
  }
}
