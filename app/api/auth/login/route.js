import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../../../lib/db';
import { rateLimit } from '../../../../lib/rateLimit';
import { headers } from 'next/headers';
import { isValidEmail, isValidPassword } from '../../../../lib/validators';
import { logger } from '../../../../lib/logger';

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

    const { email, password } = await req.json();

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ 
      success: true, 
      user: { name: user.name, email: user.email, avatar: user.avatar_url } 
    });

    // Configurar cookie segura (HttpOnly)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Login Error', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
