import 'dotenv/config';
import pool from './lib/db.js';

async function checkDB() {
  const [rows] = await pool.query('SELECT id, name, email, LENGTH(avatar_url) as avatarLen, avatar_url FROM users');
  console.log('=== USERS IN DB ===');
  rows.forEach(r => {
    console.log(`ID: ${r.id}`);
    console.log(`Name: ${r.name}`);
    console.log(`Email: ${r.email}`);
    console.log(`Avatar Length: ${r.avatarLen}`);
    console.log(`Avatar Preview: ${r.avatar_url ? r.avatar_url.substring(0, 100) : 'null'}`);
    console.log('------------------');
  });
  process.exit(0);
}
checkDB().catch(console.error);
