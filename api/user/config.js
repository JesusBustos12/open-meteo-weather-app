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
    const { theme, language } = req.body;

    const normalizedTheme = theme !== undefined ? theme : null;
    const normalizedLanguage = language !== undefined ? language : null;

    if (normalizedTheme === null && normalizedLanguage === null) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    await pool.execute(
      'UPDATE user_preferences SET theme = COALESCE(?, theme), language = COALESCE(?, language) WHERE user_id = ?',
      [normalizedTheme, normalizedLanguage, userId]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Config error:', error.message);
    return res.status(500).json({ error: 'Error al actualizar configuración' });
  } finally {
    await pool.end();
  }
}
