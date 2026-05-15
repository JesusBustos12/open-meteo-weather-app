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
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const pool = getPool();

  try {
    if (req.method === 'POST') {
      const { name, latitude, longitude } = req.body;

      if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Datos de la ciudad incompletos' });
      }

      await pool.execute(
        'INSERT INTO favorite_cities (user_id, name, latitude, longitude) VALUES (?, ?, ?, ?)',
        [userId, name, latitude, longitude]
      );

      return res.status(201).json({ success: true });

    } else if (req.method === 'DELETE') {
      // El nombre viene en la URL: /api/user/cities?name=xxx
      const cityName = req.query.name;

      if (!cityName) {
        return res.status(400).json({ error: 'Nombre de la ciudad es requerido' });
      }

      await pool.execute(
        'DELETE FROM favorite_cities WHERE user_id = ? AND name = ?',
        [userId, cityName]
      );

      return res.status(200).json({ success: true });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La ciudad ya está en tus favoritos' });
    }
    console.error('Cities error:', error.message);
    return res.status(500).json({ error: 'Error al procesar ciudad' });
  } finally {
    await pool.end();
  }
}
