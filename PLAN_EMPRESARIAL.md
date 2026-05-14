# Plan de Implementación Empresarial — WeatherApp

> **Objetivo**: Llevar el proyecto WeatherApp al nivel empresarial manteniendo toda la funcionalidad actual intacta.  
> **Modelo asignado**: Gemini 3 Flash  
> **Regla fundamental**: No romper ninguna funcionalidad existente. Cada fase debe terminar con `node __tests__/full-audit.test.js` pasando 62/62 tests.

---

## Contexto del Proyecto

- **Stack**: Next.js 16 + MySQL + Zustand + Vanilla CSS
- **Archivos core**: `app/(dashboard)/page.jsx`, `app/(auth)/login/page.jsx`, `lib/store.js`, `lib/db.js`, `lib/auth.js`, `lib/i18nData.js`
- **Componentes**: `SearchBar.jsx`, `WeatherWidgets.jsx`, `HourlyForecast.jsx`, `LeafletMap.jsx`, `ProfileModal.jsx`
- **API Routes**: `app/api/auth/login`, `app/api/auth/register`, `app/api/auth/logout`, `app/api/user/sync`, `app/api/user/cities`, `app/api/user/config`, `app/api/user/profile`, `app/api/weather`, `app/api/geocoding`
- **Reglas del proyecto**: Ver `Agents.md` en la raíz. Seguir estrictamente sus indicaciones.

---

## FASE 1: Limpieza y Consolidación (Prioridad ALTA)

### 1.1 — Eliminar el servidor Express legacy

**Problema**: `server.js` (344 líneas) duplica toda la lógica que ya existe en `app/api/`. Genera confusión y riesgo de desincronización.

**Acción**:
1. Eliminar `server.js` de la raíz del proyecto.
2. Eliminar del `package.json` las dependencias exclusivas de Express que NO use Next.js:
   - `express`
   - `helmet`
   - `cors`
   - `express-rate-limit`
   - `axios`
   - `cookie-parser`
3. Ejecutar `npm install` para actualizar el `package-lock.json`.
4. **NO eliminar**: `bcryptjs`, `jsonwebtoken`, `mysql2` — los usa Next.js.

**Verificación**: `node __tests__/full-audit.test.js` → 62/62 PASS. La app debe funcionar con `npm run dev`.

---

### 1.2 — Arreglar `.env.example`

**Problema**: La línea 14 de `.env.example` está corrupta con caracteres null (`\u0000`).

**Acción**: Reescribir el archivo completo:

```env
PORT=3000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_USER=weather_user
DB_PASS=CAMBIAR_EN_PRODUCCION
DB_NAME=weather_app_db

# Security Secrets (Generar claves de 32+ caracteres aleatorios en producción)
JWT_SECRET=CAMBIAR_EN_PRODUCCION_usar_openssl_rand_base64_32
COOKIE_SECRET=CAMBIAR_EN_PRODUCCION_usar_openssl_rand_base64_32
ALLOWED_ORIGIN=http://localhost:3000
```

---

### 1.3 — Actualizar `.gitignore`

**Acción**: Agregar las siguientes líneas al `.gitignore` existente:

```gitignore
# Next.js
.next/
out/

# Tests
test_results.txt
coverage/
```

---

### 1.4 — Actualizar Dockerfile para Next.js

**Problema**: El Dockerfile actual ejecuta `node server.js` (Express). Debe usar `next build` + `next start`.

**Acción**: Reemplazar el contenido del `Dockerfile` por:

```dockerfile
# 1. Fase de Construcción
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Fase de Producción
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/setup_db.sql ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npx", "next", "start"]
```

---

### 1.5 — Actualizar `docker-compose.yml`

**Problema**: Tiene secretos hardcodeados.

**Acción**: Reemplazar los valores de secretos por variables de entorno:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
    networks:
      - weather-net

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PASS}
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-root_secure_password}
    volumes:
      - ./setup_db.sql:/docker-entrypoint-initdb.d/setup_db.sql
      - weather-db-data:/var/lib/mysql
    networks:
      - weather-net

networks:
  weather-net:
    driver: bridge

volumes:
  weather-db-data:
```

---

### 1.6 — Eliminar `vercel.json`

**Problema**: Apunta a `server.js` (Express legacy). Vercel detecta Next.js automáticamente.

**Acción**: Eliminar `vercel.json`.

---

## FASE 2: Seguridad (Prioridad ALTA)

### 2.1 — Rate Limiting en API Routes de Next.js

**Problema**: Las rutas `app/api/auth/login` y `app/api/auth/register` no tienen protección contra ataques de fuerza bruta.

**Acción**: Crear un middleware de rate limiting sin dependencias externas.

1. Crear `lib/rateLimit.js`:

```javascript
// Rate limiter simple en memoria (sin dependencias externas)
const rateLimitMap = new Map();

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 100 } = {}) {
  return function check(ip) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const timestamps = rateLimitMap.get(ip).filter(t => t > windowStart);
    rateLimitMap.set(ip, timestamps);

    if (timestamps.length >= max) {
      return false; // Límite excedido
    }

    timestamps.push(now);
    return true; // Petición permitida
  };
}

// Limpiar entradas antiguas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap) {
    const filtered = timestamps.filter(t => t > now - 15 * 60 * 1000);
    if (filtered.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, filtered);
    }
  }
}, 5 * 60 * 1000);
```

2. Aplicar en `app/api/auth/login/route.js` y `app/api/auth/register/route.js`:

```javascript
import { rateLimit } from '../../../../lib/rateLimit';
import { headers } from 'next/headers';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

export async function POST(req) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || 'unknown';
  
  if (!limiter(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espere 15 minutos.' },
      { status: 429 }
    );
  }
  
  // ... resto de la lógica existente sin cambios
}
```

---

### 2.2 — Validación de Email en el Backend

**Problema**: El backend acepta cualquier string como email.

**Acción**: Crear `lib/validators.js`:

```javascript
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 150;
}

export function isValidPassword(password) {
  return password && typeof password === 'string' && password.length >= 6 && password.length <= 128;
}

export function isValidName(name) {
  return name && typeof name === 'string' && name.trim().length >= 1 && name.length <= 100;
}
```

Luego importar y usar en `app/api/auth/login/route.js` y `app/api/auth/register/route.js`:

```javascript
import { isValidEmail, isValidPassword, isValidName } from '../../../../lib/validators';

// En login:
if (!isValidEmail(email) || !isValidPassword(password)) {
  return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
}

// En register:
if (!isValidName(name) || !isValidEmail(email) || !isValidPassword(password)) {
  return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
}
```

---

### 2.3 — Middleware de Autenticación Centralizado

**Problema**: Cada API Route repite la misma verificación de token.

**Acción**: Crear `lib/withAuth.js`:

```javascript
import { NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function withAuth(handler) {
  return async function(req, ...args) {
    const userId = verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    req.userId = userId;
    return handler(req, ...args);
  };
}
```

Luego refactorizar las rutas protegidas. Ejemplo para `app/api/user/sync/route.js`:

```javascript
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { withAuth } from '../../../../lib/withAuth';

async function handler(req) {
  try {
    const userId = req.userId;
    const [uRows] = await pool.execute('SELECT name, email, avatar_url FROM users WHERE id = ?', [userId]);
    const [pRows] = await pool.execute('SELECT theme, language FROM user_preferences WHERE user_id = ?', [userId]);
    const [cRows] = await pool.execute('SELECT id, name, latitude, longitude FROM favorite_cities WHERE user_id = ?', [userId]);

    return NextResponse.json({
      user: uRows[0],
      preferences: pRows[0],
      cities: cRows
    });
  } catch (error) {
    console.error('[ERROR] Sync:', error);
    return NextResponse.json({ error: 'Error al sincronizar datos' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
```

Aplicar el mismo patrón a: `cities/route.js`, `config/route.js`, `profile/route.js`, `cities/[name]/route.js`.

---

## FASE 3: Testing (Prioridad ALTA)

### 3.1 — Configurar Jest + React Testing Library

**Acción**:

1. Instalar dependencias de desarrollo:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

2. Crear `jest.config.js` en la raíz:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/__tests__/full-audit.test.js']
};

module.exports = createJestConfig(customJestConfig);
```

3. Crear `jest.setup.js`:
```javascript
import '@testing-library/jest-dom';
```

4. Agregar script en `package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:audit": "node __tests__/full-audit.test.js"
}
```

---

### 3.2 — Tests Unitarios para Utilidades

Crear `__tests__/unit/validators.test.js`:

```javascript
import { isValidEmail, isValidPassword, isValidName } from '../../lib/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    test('acepta email válido', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });
    test('rechaza email sin @', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
    });
    test('rechaza string vacío', () => {
      expect(isValidEmail('')).toBe(false);
    });
    test('rechaza null', () => {
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    test('acepta 6+ caracteres', () => {
      expect(isValidPassword('123456')).toBe(true);
    });
    test('rechaza menos de 6 caracteres', () => {
      expect(isValidPassword('12345')).toBe(false);
    });
  });

  describe('isValidName', () => {
    test('acepta nombre válido', () => {
      expect(isValidName('Juan')).toBe(true);
    });
    test('rechaza nombre vacío', () => {
      expect(isValidName('')).toBe(false);
    });
  });
});
```

---

### 3.3 — Tests Unitarios para el Store (Zustand)

Crear `__tests__/unit/store.test.js`:

```javascript
import { useStore } from '../../lib/store';

describe('Zustand Store', () => {
  beforeEach(() => {
    useStore.setState({
      user: null,
      theme: 'dark',
      language: 'es',
      cities: [],
      toastMessage: null
    });
  });

  test('setUser actualiza el usuario', () => {
    useStore.getState().setUser({ name: 'Test', email: 'test@test.com' });
    expect(useStore.getState().user).toEqual({ name: 'Test', email: 'test@test.com' });
  });

  test('setLanguage cambia el idioma', () => {
    useStore.getState().setLanguage('en');
    expect(useStore.getState().language).toBe('en');
  });

  test('setTheme cambia el tema', () => {
    useStore.getState().setTheme('light');
    expect(useStore.getState().theme).toBe('light');
  });

  test('addCity agrega una ciudad', () => {
    useStore.getState().addCity({ name: 'Madrid', latitude: 40.4, longitude: -3.7 });
    expect(useStore.getState().cities).toHaveLength(1);
    expect(useStore.getState().cities[0].name).toBe('Madrid');
  });

  test('removeCity elimina una ciudad', () => {
    useStore.setState({ cities: [{ name: 'Madrid' }, { name: 'Lima' }] });
    useStore.getState().removeCity('Madrid');
    expect(useStore.getState().cities).toHaveLength(1);
    expect(useStore.getState().cities[0].name).toBe('Lima');
  });

  test('showToast muestra un mensaje', () => {
    useStore.getState().showToast('Test message', 'success');
    expect(useStore.getState().toastMessage).toBe('Test message');
    expect(useStore.getState().toastType).toBe('success');
  });
});
```

---

### 3.4 — Tests Unitarios para i18n

Crear `__tests__/unit/i18n.test.js`:

```javascript
import { I18N } from '../../lib/i18nData';

describe('i18n Data', () => {
  test('tiene las claves en español e inglés', () => {
    expect(I18N).toHaveProperty('es');
    expect(I18N).toHaveProperty('en');
  });

  test('ambos idiomas tienen las mismas claves', () => {
    const esKeys = Object.keys(I18N.es).sort();
    const enKeys = Object.keys(I18N.en).sort();
    expect(esKeys).toEqual(enKeys);
  });

  test('ninguna traducción está vacía', () => {
    for (const [key, value] of Object.entries(I18N.es)) {
      expect(value).toBeTruthy();
    }
    for (const [key, value] of Object.entries(I18N.en)) {
      expect(value).toBeTruthy();
    }
  });
});
```

---

### 3.5 — Tests de Integración para API Routes

Crear `__tests__/integration/auth.test.js`:

```javascript
// Nota: Estos tests requieren una BD de test configurada.
// Se recomienda ejecutarlos en CI/CD con docker-compose up -d db.

describe('Auth API Routes', () => {
  const BASE = 'http://localhost:3000';

  test('POST /api/auth/register — datos incompletos retorna 400', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }) // Falta email y password
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — credenciales inválidas retorna 401', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'noexiste@test.com', password: 'wrongpassword' })
    });
    expect(res.status).toBe(401);
  });

  test('GET /api/user/sync — sin token retorna 401', async () => {
    const res = await fetch(`${BASE}/api/user/sync`);
    expect(res.status).toBe(401);
  });
});
```

---

## FASE 4: CI/CD Pipeline (Prioridad MEDIA)

### 4.1 — GitHub Actions

Crear `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run audit tests
        run: node __tests__/full-audit.test.js
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Build check
        run: npm run build

  docker-build:
    runs-on: ubuntu-latest
    needs: lint-and-test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t weatherapp:${{ github.sha }} .
```

---

## FASE 5: Logging y Monitoreo (Prioridad MEDIA)

### 5.1 — Logger Estructurado

Crear `lib/logger.js` (sin dependencias externas):

```javascript
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LEVEL]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta)
};
```

**Luego** reemplazar todos los `console.error('[ERROR]...')` en las API Routes por `logger.error(...)`.

---

## FASE 6: Rendimiento (Prioridad MEDIA)

### 6.1 — Caché para Respuestas de Clima

Crear `lib/cache.js`:

```javascript
const cache = new Map();

export function getCached(key, ttlMs = 5 * 60 * 1000) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Limpiar caché cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > 10 * 60 * 1000) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);
```

Aplicar en `app/api/weather/route.js`:

```javascript
import { getCached, setCache } from '../../../lib/cache';

// Dentro del handler, antes del fetch a Open-Meteo:
const cacheKey = `weather_${latitude}_${longitude}`;
const cached = getCached(cacheKey);
if (cached) {
  return NextResponse.json(cached);
}

// Después de obtener la respuesta:
setCache(cacheKey, data);
```

---

## FASE 7: README.md Profesional (Prioridad ALTA para portafolio)

### 7.1 — Crear `README.md`

Crear un README.md con las siguientes secciones:

```markdown
# 🌤️ WeatherApp — Pronóstico del Tiempo en Tiempo Real

Aplicación web full-stack que muestra pronósticos meteorológicos en tiempo real con mapa interactivo, sistema de autenticación y persistencia de datos.

## ✨ Características
- Búsqueda de ciudades con autocompletado inteligente
- Pronóstico actual y por horas (12h)
- Mapa interactivo con Leaflet
- Sistema de autenticación (registro/login)
- Ciudades favoritas por usuario
- Tema claro/oscuro
- Bilingüe (Español/Inglés)
- Responsive design

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 16, Vanilla CSS, Leaflet
- **Backend**: Next.js API Routes, MySQL
- **Auth**: JWT + Cookies HttpOnly + bcrypt
- **Estado**: Zustand
- **Deploy**: Docker + Docker Compose

## 🚀 Inicio Rápido

### Requisitos
- Node.js 20+
- MySQL 8.0+

### Instalación
1. Clonar repositorio
2. `cp .env.example .env` y configurar variables
3. Ejecutar `setup_db.sql` en MySQL
4. `npm install`
5. `npm run dev`

### Docker
docker compose up -d

## 📸 Screenshots
(Agregar capturas de pantalla aquí)

## 📄 Licencia
MIT
```

---

## Orden de Ejecución Recomendado

| # | Fase | Prioridad | Riesgo |
|---|---|---|---|
| 1 | Fase 1: Limpieza (1.1 → 1.6) | 🔴 Alta | Bajo |
| 2 | Fase 7: README.md | 🔴 Alta | Nulo |
| 3 | Fase 2: Seguridad (2.1 → 2.3) | 🔴 Alta | Medio |
| 4 | Fase 3: Testing (3.1 → 3.5) | 🔴 Alta | Bajo |
| 5 | Fase 4: CI/CD | 🟡 Media | Bajo |
| 6 | Fase 5: Logging | 🟡 Media | Bajo |
| 7 | Fase 6: Caché | 🟡 Media | Bajo |

---

## Verificación Final

Después de completar TODAS las fases:

1. `node __tests__/full-audit.test.js` → 62/62 PASS
2. `npm test` → Todos los tests unitarios PASS
3. `npm run build` → Build exitoso sin errores
4. `docker compose up --build` → App funcional en Docker
5. Verificar manualmente en el navegador:
   - Login y registro funcionan
   - Búsqueda de ciudades funciona
   - Cambio de idioma funciona
   - Cambio de tema funciona
   - Guardar/eliminar ciudades funciona
   - Mapa interactivo muestra datos
   - Consola del navegador sin errores rojos
