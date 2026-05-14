# Auditoría y Guía Definitiva de Despliegue en Vercel (Monolitos Node.js + Frontend)

Esta guía ha sido creada a partir de la experiencia resolviendo los errores más comunes (404, 405, ENOENT, CORS, ECONNREFUSED) al intentar desplegar un proyecto Full-Stack (Monolito con Frontend y Backend separados en carpetas pero unificados en un solo repositorio) en Vercel.

Úsala como un "Checklist" antes de desplegar tus próximos proyectos para asegurar un despliegue exitoso a la primera.

---

## 1. Arquitectura: Separar API de Archivos Estáticos
**El problema:** Intentar que Express sirva los archivos estáticos de React/Vite (usando `app.use(express.static)`) suele fallar en Vercel con errores `ENOENT`, ya que Vercel empaqueta las funciones y pierde el rastro de la carpeta del frontend.
**La solución:** Dejar que Vercel sirva el frontend directamente (es mucho más rápido) y que Express solo funcione como API.

*   **Paso 1:** Crea una carpeta llamada `api` en la raíz de tu proyecto.
*   **Paso 2:** Crea un archivo `api/index.js`. Este será el punto de entrada de tu backend para Vercel.
*   **Paso 3:** En lugar de hacer `app.listen(...)` en ese archivo, debes **exportar** la aplicación de Express:
    ```javascript
    // api/index.js
    require('dotenv').config();
    const app = require('../ruta/a/tu/configuracion/express');
    module.exports = app; // ¡CRUCIAL PARA VERCEL!
    ```
*(Nota: Si usas `app.listen()` o dejas el archivo en la raíz sin configurar el builder, Vercel lo tratará como un archivo estático, causando el error **405 Method Not Allowed** al hacer peticiones POST).*

---

## 2. Configuración de Vercel (`vercel.json`)
**El problema:** Usar la propiedad `"builds"` anula el comportamiento por defecto de Vercel, impidiendo que ejecute tus scripts de construcción del frontend.
**La solución:** Usar la configuración "Zero-Config" de Vercel combinada con reescrituras (rewrites).

Crea o modifica el archivo `vercel.json` en la raíz exactamente así:
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*Esto asegura que todo el tráfico de la API vaya a tu backend, y todo el tráfico del usuario vaya a tu frontend (Single Page Application).*

---

## 3. Script de Construcción (`package.json`)
**El problema:** Vercel necesita saber cómo compilar tu frontend y dónde encontrar los archivos terminados. Si el script falla o no instala las dependencias, la pantalla se queda en blanco.
**La solución:** Un script de build robusto en el `package.json` de la raíz que compile el frontend y mueva el resultado a una carpeta `public`. Vercel sirve automáticamente el contenido de la carpeta `public`.

En tu `package.json` de la raíz:
```json
"scripts": {
  "build": "cd frontend && npm install && npm run build && cd .. && mkdir -p public && cp -r frontend/dist/* public/"
}
```
*(Asegúrate de cambiar `frontend/dist/*` por la carpeta que genere tu framework, por ejemplo `frontend/build/*` si usas Create React App).*

---

## 4. Configuración de CORS
**El problema:** El backend bloquea las peticiones del frontend con un error 500 o `CORS Origin Not Allowed` porque el dominio que te asigna Vercel (ej. `mi-app-blabla.vercel.app`) no está en tu lista blanca de orígenes permitidos.
**La solución:** Permitir dinámicamente cualquier subdominio de Vercel.

En la configuración de CORS de Express:
```javascript
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3000'];
        // Permite localhost O cualquier dominio de Vercel
        if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true
}));
```

---

## 5. Base de Datos en la Nube
**El problema:** El error `connect ECONNREFUSED 127.0.0.1:3306` ocurre porque Vercel intenta conectarse a un MySQL local que no existe en su entorno en la nube.
**La solución:** La base de datos debe estar alojada externamente.

*   **Paso 1:** Crea una base de datos gratuita en la nube (ej. **Aiven.io** o **TiDB Serverless**).
*   **Paso 2:** Asegúrate de que tu conexión en el código soporte puertos dinámicos:
    ```javascript
    const dbConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306, // Importante añadir el puerto
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    };
    ```
*   **Paso 3:** Ve al panel de control de Vercel (Settings > Environment Variables) y añade **TODAS** tus variables de entorno (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`). ¡Vercel no lee tu archivo `.env`!

---

## Resumen de Checklist para el Próximo Proyecto:
- [ ] ¿El entry point del backend está en `api/index.js` y usa `module.exports = app`?
- [ ] ¿El `vercel.json` tiene los `rewrites` correctos y **NO** usa la etiqueta `"builds"`?
- [ ] ¿El `package.json` raíz tiene un script `"build"` que mueve el frontend compilado a la carpeta raíz `public`?
- [ ] ¿CORS está configurado para permitir dominios `.vercel.app`?
- [ ] ¿La conexión a la BD acepta un `DB_PORT` dinámico?
- [ ] ¿Has puesto las credenciales de la BD en la nube dentro de las Environment Variables de Vercel?
