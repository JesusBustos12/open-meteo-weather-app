import 'dotenv/config';
import pool from './lib/db.js';

async function testUpdate() {
  try {
    console.log("Testeando UPDATE directo en la base de datos...");
    
    // 1. Obtener el usuario actual
    const [users] = await pool.query('SELECT id, name, email FROM users LIMIT 1');
    if (users.length === 0) {
      console.log("No hay usuarios.");
      process.exit(0);
    }
    const user = users[0];
    console.log("Usuario actual ANTES del update:", user);
    
    // 2. Intentar actualizar su nombre a algo temporal
    const testName = user.name + " Test";
    console.log("Intentando actualizar nombre a:", testName);
    
    const query = 'UPDATE users SET name = ? WHERE id = ?';
    const params = [testName, user.id];
    
    const [result] = await pool.execute(query, params);
    console.log("Resultado del UPDATE:", result);
    
    // 3. Volver a leer para confirmar
    const [usersAfter] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [user.id]);
    console.log("Usuario DESPUÉS del update:", usersAfter[0]);
    
    if (usersAfter[0].name === testName) {
      console.log("✅ EL UPDATE FUNCIONA PERFECTAMENTE A NIVEL DE BASE DE DATOS.");
      // Revertir
      await pool.execute('UPDATE users SET name = ? WHERE id = ?', [user.name, user.id]);
    } else {
      console.log("❌ EL UPDATE FALLÓ EN LA BASE DE DATOS AUNQUE MYSQL NO DIO ERROR.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testUpdate();
