import 'dotenv/config';
import pool from './lib/db.js';

async function testE2E() {
  console.log('=== TEST E2E: Flujo completo de persistencia ===\n');

  const userId = 1;

  // 1. Leer estado ACTUAL de la BD
  const [before] = await pool.query('SELECT name, email, avatar_url FROM users WHERE id = ?', [userId]);
  console.log('ANTES del update:');
  console.log('  name:', before[0].name);
  console.log('  email:', before[0].email);
  console.log('  avatar_url length:', before[0].avatar_url?.length || 0);
  console.log('  avatar_url preview:', (before[0].avatar_url || '').substring(0, 80));
  console.log('');

  // 2. Simular PUT /api/user/profile
  const nuevoNombre = 'Jesus Bustos TEST-' + Date.now();
  const nuevoAvatar = 'https://test-avatar.com/test.png';
  
  console.log('Simulando PUT /api/user/profile...');
  console.log('  Nuevo nombre:', nuevoNombre);
  console.log('  Nuevo avatar:', nuevoAvatar);
  
  const [updateResult] = await pool.query('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?', [nuevoNombre, nuevoAvatar, userId]);
  console.log('  UPDATE result:', JSON.stringify(updateResult));
  console.log('');

  // 3. Simular GET /api/user/sync
  console.log('Simulando GET /api/user/sync...');
  const [afterSync] = await pool.query('SELECT name, email, avatar_url FROM users WHERE id = ?', [userId]);
  console.log('  name:', afterSync[0].name);
  console.log('  email:', afterSync[0].email);
  console.log('  avatar_url:', afterSync[0].avatar_url);
  console.log('');

  // 4. Verificar
  if (afterSync[0].name === nuevoNombre && afterSync[0].avatar_url === nuevoAvatar) {
    console.log('✅ PERSISTENCIA FUNCIONA: La BD devuelve los datos actualizados.');
  } else {
    console.log('❌ FALLO: La BD NO devolvió los datos actualizados.');
  }

  // 5. Restaurar datos originales
  console.log('\nRestaurando datos originales...');
  await pool.query('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?', [before[0].name, before[0].avatar_url, userId]);
  console.log('  Restaurado — name:', before[0].name);

  process.exit(0);
}

testE2E().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
