import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

function getPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = getPool();

  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase(), hash, avatar || '']
    );

    const userId = result.insertId;
    await pool.execute('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Cookie segura
    const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; ${secure} SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

    return res.status(201).json({ success: true, user: { name, email, avatar } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya existe' });
    }
    console.error('Register error:', error.message);
    return res.status(500).json({ error: 'Error en el servidor', details: error.message });
  } finally {
    await pool.end();
  }
}
