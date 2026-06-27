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

function getUserId(req) {
  try {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/token=([^;]+)/);
    if (!match) return null;
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const pool = getPool();

  try {
    const { name, email, password, avatar_url } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    let query = 'UPDATE users SET name = ?, email = ?, avatar_url = ?';
    let params = [name, email.toLowerCase(), avatar_url || ''];

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      const hash = await bcrypt.hash(password, 10);
      query += ', password_hash = ?';
      params.push(hash);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    await pool.query(query, params);

    return res.status(200).json({ 
      success: true, 
      user: { name, email: email.toLowerCase(), avatar_url } 
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
    }
    console.error('Profile update error:', error.message);
    return res.status(500).json({ error: 'Error del servidor al actualizar perfil' });
  } finally {
    await pool.end();
  }
}
