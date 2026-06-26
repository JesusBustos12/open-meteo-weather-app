import 'dotenv/config';
import pool from './lib/db.js';

async function test() {
  try {
    console.log("Conectando a la DB en:", process.env.DB_HOST);
    const [users] = await pool.query('SELECT id, name, email, LENGTH(avatar_url) as avatar_size FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.log("No hay usuarios en la BD.");
      process.exit(0);
    }
    
    const user = users[0];
    console.log("Usuario actual en BD:", user);
    
    console.log("---------------------------------------");
    console.log("Si el avatar_size es 0 o null, significa que la BD NUNCA guardó el logo.");
    console.log("Si el avatar_size es grande (> 1000), la BD SÍ lo tiene guardado, pero algo falla al leerlo.");
    console.log("---------------------------------------");
    
    process.exit(0);
  } catch (err) {
    console.error("Error al conectar o consultar:", err);
    process.exit(1);
  }
}

test();
