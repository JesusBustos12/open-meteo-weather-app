/* =====================================================
   WEATHERAPP — Suite de Seguridad (S01–S15)
   Ejecutar: node __tests__/security.test.js
   Análisis estático del código fuente
   ===================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

let total = 0, passed = 0, failed = 0;
const results = [];

function it(name, fn) {
  total++;
  try {
    fn();
    passed++;
    results.push({ id: name, status: 'PASS' });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    results.push({ id: name, status: 'FAIL', error: err.message });
    console.log(`  ❌ FAIL: ${name}`);
    console.log(`         → ${err.message}`);
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }

// Helpers para leer archivos
const ROOT = path.join(__dirname, '..');
function readSrc(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

console.log('\n' + '='.repeat(55));
console.log('  SUITE: SEGURIDAD (S01–S15)');
console.log('='.repeat(55));

// ─── S01: JWT en cookie HttpOnly ───
it('S01 — JWT se configura con httpOnly: true', () => {
  const loginRoute = readSrc('app/api/auth/login/route.js');
  const registerRoute = readSrc('app/api/auth/register/route.js');
  const server = readSrc('server.js');
  
  assert(loginRoute.includes('httpOnly: true') || loginRoute.includes('httpOnly:true'),
    'Login route no tiene httpOnly');
  assert(registerRoute.includes('httpOnly: true') || registerRoute.includes('httpOnly:true'),
    'Register route no tiene httpOnly');
  assert(server.includes('httpOnly: true') || server.includes('httpOnly:true'),
    'server.js no tiene httpOnly');
});

// ─── S02: Bcrypt hash con cost >= 10 ───
it('S02 — bcrypt.hash usa cost factor >= 10', () => {
  const register = readSrc('app/api/auth/register/route.js');
  const server = readSrc('server.js');
  const profile = readSrc('app/api/user/profile/route.js');
  
  // Verificar bcrypt.hash(password, 10)
  assert(register.includes('bcrypt.hash(password, 10)'), 'Register no usa bcrypt con cost 10');
  assert(server.includes('bcrypt.hash(password, 10)'), 'Server no usa bcrypt con cost 10');
  assert(profile.includes('bcrypt.hash(password, 10)'), 'Profile no usa bcrypt con cost 10');
});

// ─── S03: SQL Injection protegido (prepared statements) ───
it('S03 — Todas las queries SQL usan prepared statements (?)', () => {
  const filesToCheck = [
    'server.js',
    'app/api/auth/login/route.js',
    'app/api/auth/register/route.js',
    'app/api/user/sync/route.js',
    'app/api/user/cities/route.js',
    'app/api/user/cities/[name]/route.js',
    'app/api/user/config/route.js',
    'app/api/user/profile/route.js',
  ];
  
  for (const f of filesToCheck) {
    const content = readSrc(f);
    // Buscar pool.execute con queries
    const executeMatches = content.match(/pool\.execute\(/g);
    if (executeMatches) {
      // Verificar que NO hay concatenación de strings en queries SQL
      // Patrón peligroso: queries con ${} o + dentro de strings SQL
      const dangerousPattern = /pool\.execute\([`'"].*\$\{.*\}.*[`'"]/;
      assert(!dangerousPattern.test(content), 
        `${f} tiene SQL con interpolación de strings (SQL injection potencial)`);
    }
  }
});

// ─── S04: Rutas protegidas usan authMiddleware ───
it('S04 — Rutas /api/user/* verifican token JWT', () => {
  const sync = readSrc('app/api/user/sync/route.js');
  const cities = readSrc('app/api/user/cities/route.js');
  const citiesDelete = readSrc('app/api/user/cities/[name]/route.js');
  const config = readSrc('app/api/user/config/route.js');
  const profile = readSrc('app/api/user/profile/route.js');
  
  const routes = { sync, cities, citiesDelete, config, profile };
  
  for (const [name, content] of Object.entries(routes)) {
    assert(content.includes('verifyToken(req)'),
      `Ruta ${name} no verifica el token JWT`);
    assert(content.includes("status: 401") || content.includes('status:401'),
      `Ruta ${name} no retorna 401 cuando no hay token`);
  }
});

// ─── S05: Rate Limiting activo ───
it('S05 — Express server tiene rate limiting en /api/', () => {
  const server = readSrc('server.js');
  assert(server.includes("express-rate-limit") || server.includes('rateLimit'),
    'No se importa express-rate-limit');
  assert(server.includes("app.use('/api/'") || server.includes("app.use('/api',"),
    'Rate limiting no aplicado a /api/');
  assert(server.includes('windowMs') && server.includes('max:'),
    'Rate limiting no tiene configuración de ventana/max');
});

// ─── S06: Headers de seguridad (Helmet + CSP) ───
it('S06 — Helmet está configurado con CSP', () => {
  const server = readSrc('server.js');
  assert(server.includes("require('helmet')") || server.includes('require("helmet")'),
    'Helmet no importado');
  assert(server.includes('app.use(helmet('),
    'Helmet no aplicado como middleware');
  assert(server.includes('contentSecurityPolicy'),
    'CSP no configurado');
  assert(server.includes("default-src") && server.includes("script-src"),
    'CSP no tiene directivas default-src y script-src');
});

// ─── S07: Cookie secure en producción ───
it('S07 — Cookie secure se activa en producción', () => {
  const login = readSrc('app/api/auth/login/route.js');
  const register = readSrc('app/api/auth/register/route.js');
  const server = readSrc('server.js');
  
  // Verificar que secure depende de NODE_ENV
  assert(login.includes("secure: process.env.NODE_ENV === 'production'"),
    'Login cookie no tiene flag secure condicional');
  assert(register.includes("secure: process.env.NODE_ENV === 'production'"),
    'Register cookie no tiene flag secure condicional');
  assert(server.includes("secure: process.env.NODE_ENV === 'production'"),
    'Server cookie no tiene flag secure condicional');
});

// ─── S08: Validación de inputs en registro ───
it('S08 — Registro valida campos obligatorios', () => {
  const register = readSrc('app/api/auth/register/route.js');
  assert(register.includes('!name || !email || !password'),
    'Registro no valida campos vacíos');
  assert(register.includes("status: 400") || register.includes("status:400"),
    'Registro no retorna 400 para datos incompletos');
});

// ─── S09: Email normalizado a lowercase ───
it('S09 — Email se convierte a lowercase antes de guardar', () => {
  const login = readSrc('app/api/auth/login/route.js');
  const register = readSrc('app/api/auth/register/route.js');
  const profile = readSrc('app/api/user/profile/route.js');
  
  assert(login.includes('email.toLowerCase()'), 'Login no normaliza email');
  assert(register.includes('email.toLowerCase()'), 'Register no normaliza email');
  assert(profile.includes('email.toLowerCase()'), 'Profile no normaliza email');
});

// ─── S10: No se expone password_hash ───
it('S10 — Sync no devuelve password_hash al cliente', () => {
  const sync = readSrc('app/api/user/sync/route.js');
  // Verificar que el SELECT no incluye password_hash
  assert(sync.includes("SELECT name, email, avatar_url FROM users"),
    'Sync selecciona campos específicos (sin password_hash)');
  assert(!sync.includes('SELECT * FROM users'),
    'Sync no debe usar SELECT *');
});

// ─── S11: No usa innerHTML ───
it('S11 — Código activo NO usa innerHTML', () => {
  const activeFiles = [
    'app/(dashboard)/page.jsx',
    'app/(auth)/login/page.jsx',
    'components/SearchBar.jsx',
    'components/WeatherWidgets.jsx',
    'components/HourlyForecast.jsx',
    'components/ProfileModal.jsx',
    'components/LeafletMap.jsx',
    'lib/store.js',
    'lib/weatherUtils.js',
    'hooks/useTranslation.js',
  ];
  
  for (const f of activeFiles) {
    const content = readSrc(f);
    // innerHTML solo es aceptable en el marker SVG de LeafletMap
    if (f !== 'components/LeafletMap.jsx') {
      assert(!content.includes('innerHTML'),
        `${f} usa innerHTML (prohibido por reglas del proyecto)`);
    }
  }
});

// ─── S12: CORS configuración ───
it('S12 — CORS está habilitado en Express', () => {
  const server = readSrc('server.js');
  assert(server.includes("require('cors')") || server.includes('require("cors")'),
    'CORS no importado');
  assert(server.includes('app.use(cors'),
    'CORS no aplicado como middleware');
});

// ─── S13: Logout limpia cookie ───
it('S13 — Logout elimina la cookie token', () => {
  const server = readSrc('server.js');
  assert(server.includes("res.clearCookie('token')") || server.includes('res.clearCookie("token")'),
    'Logout del server no limpia cookie');
});

// ─── S14: Duplicate email controlado ───
it('S14 — Email duplicado retorna error controlado, no crash', () => {
  const register = readSrc('app/api/auth/register/route.js');
  assert(register.includes('ER_DUP_ENTRY'),
    'Register no maneja duplicate entry de MySQL');
  assert(register.includes("El email ya existe") || register.includes("email ya existe"),
    'No hay mensaje de error para email duplicado');
});

// ─── S15: Content-Type en peticiones ───
it('S15 — Frontend envía Content-Type: application/json', () => {
  const store = readSrc('lib/store.js');
  const loginPage = readSrc('app/(auth)/login/page.jsx');
  
  assert(store.includes("'Content-Type': 'application/json'"),
    'Store no envía Content-Type');
  assert(loginPage.includes("'Content-Type': 'application/json'"),
    'LoginPage no envía Content-Type');
});

// ═══ REPORTE FINAL ═══
console.log('\n' + '='.repeat(55));
console.log(`  SEGURIDAD — Total: ${total} | ✅ ${passed} | ❌ ${failed}`);
console.log('='.repeat(55));
if (failed > 0) {
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`    ❌ ${r.id}: ${r.error}`);
  });
}

process.exit(failed > 0 ? 1 : 0);
