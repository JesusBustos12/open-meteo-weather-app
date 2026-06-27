import 'dotenv/config';
import pool from './lib/db.js';

async function testUpdateAvatar() {
  try {
    console.log("Testeando UPDATE con avatar gigante en la base de datos...");
    
    // 1. Obtener el usuario actual
    const [users] = await pool.query('SELECT id, name, email FROM users LIMIT 1');
    if (users.length === 0) {
      console.log("No hay usuarios.");
      process.exit(0);
    }
    const user = users[0];
    
    // 2. Crear un avatar simulado de ~2.6MB
    const bigAvatar = 'data:image/png;base64,' + 'A'.repeat(2667662);
    const testName = user.name + " AvatarTest";
    console.log(`Intentando actualizar nombre a: ${testName} y avatar de tamaño: ${bigAvatar.length} bytes`);
    
    const query = 'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?';
    const params = [testName, bigAvatar, user.id];
    
    console.log("Ejecutando pool.query...");
    const [result] = await pool.query(query, params);
    console.log("Resultado del pool.query:", result);
    
    // 3. Volver a leer para confirmar
    console.log("Leyendo de la BD...");
    const [usersAfter] = await pool.query('SELECT id, name, LENGTH(avatar_url) as avatarLen FROM users WHERE id = ?', [user.id]);
    console.log("Usuario DESPUÉS del update:", usersAfter[0]);
    
    if (usersAfter[0].name === testName && usersAfter[0].avatarLen === bigAvatar.length) {
      console.log("✅ EL UPDATE CON AVATAR GRANDE FUNCIONA PERFECTAMENTE.");
    } else {
      console.log("❌ EL UPDATE FALLÓ EN LA BASE DE DATOS SILENCIOSAMENTE.");
      if (usersAfter[0].name !== testName) console.log("- El nombre NO se guardó.");
      if (usersAfter[0].avatarLen !== bigAvatar.length) console.log(`- El avatar no se guardó. (Expected ${bigAvatar.length}, got ${usersAfter[0].avatarLen})`);
    }
    
    // Revertir
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [user.name, user.id]);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testUpdateAvatar();
