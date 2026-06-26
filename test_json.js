import 'dotenv/config';
import pool from './lib/db.js';

async function testJson() {
  try {
    const [rows] = await pool.query('SELECT name, email, avatar_url FROM users LIMIT 1');
    const user = rows[0];
    
    console.log("Tipo de avatar_url:", typeof user.avatar_url);
    if (user.avatar_url === null) {
      console.log("Avatar es null");
    } else if (typeof user.avatar_url === 'object' && Buffer.isBuffer(user.avatar_url)) {
      console.log("¡CUIDADO! Avatar es un BUFFER, no un string. Esto romperá el JSON de Next.js de forma silenciosa si el frontend espera un string.");
    } else if (typeof user.avatar_url === 'string') {
      console.log("Es un string de longitud:", user.avatar_url.length);
      console.log("Empieza con:", user.avatar_url.substring(0, 30));
    }
    
    // Probar JSON.stringify a ver si falla
    try {
      const jsonStr = JSON.stringify(user);
      console.log("Longitud del JSON final:", jsonStr.length);
    } catch(e) {
      console.error("Fallo al convertir a JSON:", e);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testJson();
