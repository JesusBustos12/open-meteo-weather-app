import fs from 'fs';
import pool from './lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function initDB() {
  try {
    console.log('Conectando a Aiven MySQL...');
    const sql = fs.readFileSync('setup_db.sql', 'utf8');
    
    // Separar por punto y coma, ignorando comentarios
    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));

    console.log(`Se encontraron ${queries.length} consultas para ejecutar.`);

    for (let i = 0; i < queries.length; i++) {
      console.log(`Ejecutando consulta ${i + 1}...`);
      await pool.query(queries[i]);
    }

    console.log('✅ ¡Base de datos inicializada correctamente en Aiven!');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:');
    console.error(error);
  } finally {
    process.exit(0);
  }
}

initDB();
