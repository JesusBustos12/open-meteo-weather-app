import mysql from 'mysql2/promise';

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }, // Aiven usa certificados auto-firmados
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  // En modo desarrollo, evitamos abrir múltiples conexiones por Hot Reloading
  if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false, // Solo SSL en producción/nube
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  pool = global.mysqlPool;
}

export default pool;

