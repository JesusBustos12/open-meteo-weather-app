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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const pool = getPool();

  try {
    const [uRows] = await pool.execute('SELECT name, email, avatar_url FROM users WHERE id = ?', [userId]);
    const [pRows] = await pool.execute('SELECT theme, language FROM user_preferences WHERE user_id = ?', [userId]);
    const [cRows] = await pool.execute('SELECT id, name, latitude, longitude FROM favorite_cities WHERE user_id = ?', [userId]);

    return res.status(200).json({
      user: uRows[0],
      preferences: pRows[0],
      cities: cRows
    });
  } catch (error) {
    console.error('Sync error:', error.message);
    return res.status(500).json({ error: 'Error al sincronizar datos' });
  } finally {
    await pool.end();
  }
}
