import fs from 'fs';
import dotenv from 'dotenv';

// IMPORTANTE: Cargar las variables de entorno ANTES de importar db.js
dotenv.config();

async function initDB() {
  try {
    // Importación dinámica: así db.js lee las variables ya cargadas
    const { default: pool } = await import('./lib/db.js');

    console.log('Conectando a Aiven MySQL...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Puerto: ${process.env.DB_PORT}`);
    console.log(`Usuario: ${process.env.DB_USER}`);
    console.log(`Base de datos: ${process.env.DB_NAME}`);

    const sql = fs.readFileSync('setup_db.sql', 'utf8');

    // Separar por punto y coma, limpiar comentarios dentro de cada bloque
    const queries = sql
      .split(';')
      .map(q => q.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
      .filter(q => q.length > 0);

    console.log(`Se encontraron ${queries.length} consultas para ejecutar.`);

    for (let i = 0; i < queries.length; i++) {
      console.log(`Ejecutando consulta ${i + 1}...`);
      await pool.query(queries[i]);
      console.log(`✅ Consulta ${i + 1} ejecutada con éxito.`);
    }

    console.log('✅ ¡Base de datos inicializada correctamente en Aiven!');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:');
    console.error(error.message);
  } finally {
    process.exit(0);
  }
}

initDB();
