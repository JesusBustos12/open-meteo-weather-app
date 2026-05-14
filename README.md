# 🌤️ WeatherApp — Pronóstico del Tiempo en Tiempo Real

Aplicación web full-stack que muestra pronósticos meteorológicos en tiempo real con mapa interactivo, sistema de autenticación y persistencia de datos.

## ✨ Características
- **Búsqueda Inteligente**: Autocompletado de ciudades con scoring de relevancia.
- **Pronóstico Detallado**: Datos actuales y previsión por horas (próximas 12h).
- **Mapa Interactivo**: Visualización de ubicación con Leaflet.
- **Seguridad Empresarial**: Autenticación vía JWT con Cookies HttpOnly, Rate Limiting y Validación de datos.
- **Personalización**: Guardado de ciudades favoritas, temas claro/oscuro e internacionalización (ES/EN).
- **Rendimiento**: Sistema de caché en memoria para reducir peticiones a APIs externas.
- **Calidad**: Suite completa de tests unitarios, tests de integración y auditoría estática.

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 16, Vanilla CSS, Zustand (Estado), Leaflet.
- **Backend**: Next.js API Routes (Serverless ready).
- **Base de Datos**: MySQL 8.0.
- **Seguridad**: bcrypt, jsonwebtoken, rate-limiting manual.
- **Infraestructura**: Docker, Docker Compose, GitHub Actions (CI).

## 🚀 Inicio Rápido

### Requisitos
- Node.js 20+
- MySQL 8.0+

### Instalación Local
1. Clonar el repositorio.
2. Crear archivo `.env` a partir de `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Configurar las credenciales de base de datos en `.env`.
4. Ejecutar el script SQL de inicialización:
   ```bash
   # En tu cliente MySQL
   source setup_db.sql
   ```
5. Instalar dependencias:
   ```bash
   npm install
   ```
6. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

### Docker (Recomendado)
Para levantar todo el entorno (App + DB) de forma automática:
```bash
docker compose up --build -d
```

## 🧪 Testing y Calidad
- **Tests Unitarios/Integración**: `npm test`
- **Cobertura**: `npm run test:coverage`
- **Auditoría de Requisitos**: `npm run test:audit`

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
