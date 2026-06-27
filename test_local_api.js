import 'dotenv/config';
import profileHandler from './api/user/profile.js';
import syncHandler from './api/user/sync.js';
import jwt from 'jsonwebtoken';
import pool from './lib/db.js';

// Crear un token válido para el usuario ID 1
const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);

// Helper para simular req y res de Vercel/Express
function mockReqRes(method, body = {}, cookieStr = '') {
  const req = {
    method,
    headers: {
      cookie: cookieStr || `token=${token}`,
      'content-type': 'application/json'
    },
    body
  };

  const headers = {};
  let statusCode = 200;
  let responseData = null;

  const res = {
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    end() {
      return this;
    }
  };

  return { req, res, getResult: () => ({ statusCode, headers, responseData }) };
}

async function runLocalApiTest() {
  console.log('=== TEST LOCAL API HANDLERS ===\n');

  // 1. Obtener estado actual del usuario ID 1 de la base de datos
  const [before] = await pool.query('SELECT name, email, avatar_url FROM users WHERE id = 1');
  const originalName = before[0].name;
  const originalAvatar = before[0].avatar_url;
  console.log('Antes de la prueba:');
  console.log('  Nombre en DB:', originalName);
  console.log('  Longitud Avatar en DB:', originalAvatar?.length || 0);
  console.log('');

  // 2. Ejecutar handler de profile (PUT)
  const nuevoNombre = 'Jesus Bustos API-TEST-' + Date.now();
  const nuevoAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // avatar minimal
  
  console.log('Ejecutando handler de profile (PUT)...');
  const { req: pReq, res: pRes, getResult: getPResult } = mockReqRes('PUT', {
    name: nuevoNombre,
    email: 'bustosjesus252@gmail.com', // mismo email
    avatar_url: nuevoAvatar
  });

  await profileHandler(pReq, pRes);
  const pResult = getPResult();
  console.log('Resultado profile:');
  console.log('  Status Code:', pResult.statusCode);
  console.log('  Response Data:', JSON.stringify(pResult.responseData));
  console.log('  Cache-Control Header:', pResult.headers['Cache-Control']);
  console.log('');

  // 3. Ejecutar handler de sync (GET)
  console.log('Ejecutando handler de sync (GET)...');
  const { req: sReq, res: sRes, getResult: getSResult } = mockReqRes('GET');
  await syncHandler(sReq, sRes);
  const sResult = getSResult();
  console.log('Resultado sync:');
  console.log('  Status Code:', sResult.statusCode);
  console.log('  Response Data - User Name:', sResult.responseData?.user?.name);
  console.log('  Response Data - User Avatar Length:', sResult.responseData?.user?.avatar_url?.length || 0);
  console.log('  Cache-Control Header:', sResult.headers['Cache-Control']);
  console.log('');

  // 4. Restaurar datos originales
  console.log('Restaurando datos originales en DB...');
  await pool.query('UPDATE users SET name = ?, avatar_url = ? WHERE id = 1', [originalName, originalAvatar]);
  console.log('Restauración completada.');

  await pool.end();
  console.log('\n=== TEST COMPLETADO ===');
}

runLocalApiTest().catch(console.error);
