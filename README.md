# WebApp del tiempo - Arquitectura y Desarrollo Full-Stack

## Descripción
**WebApp del tiempo** es una aplicación web interactiva de alto rendimiento que permite a los usuarios consultar el pronóstico del tiempo de diversas ciudades del mundo en tiempo real. La aplicación muestra el estado actual y una previsión atmosférica para las próximas 12 horas, apoyándose en la precisión de la API de Open-Meteo.

El proyecto destaca por su enfoque arquitectónico avanzado: un Frontend nativo desarrollado con Vanilla JS y CSS puro, emparejado con un Backend seguro que integra autenticación mediante JWT y persistencia de datos escalable en la nube a través de una base de datos TiDB. Se prioriza una experiencia de usuario (UX) fluida, un diseño premium y estándares rigurosos de ingeniería de software.

## Objetivo
Este proyecto fue concebido y diseñado para ofrecer una experiencia de nivel empresarial, demostrando sólidas capacidades en el desarrollo end-to-end:

- Demostrar un dominio profundo de **JavaScript Vanilla** para la creación de Single Page Applications (SPA) dinámicas y optimizadas.
- Implementar maquetación moderna, responsiva y de alto impacto visual utilizando **CSS3 Nativo** (Grid, Flexbox, y Custom Properties).
- Desarrollar una API RESTful segura, gestionando la persistencia de datos en la nube con **TiDB** (MySQL).
- Implementar un flujo de autenticación robusto mediante **JWT (JSON Web Tokens)**, encriptación de contraseñas con **Bcrypt**, y cookies seguras (HttpOnly).
- Consumir servicios externos de forma asíncrona, orquestando y procesando la información para su renderizado óptimo en el DOM.
- Garantizar la manipulación segura del DOM y aplicar buenas prácticas de accesibilidad y semántica en **HTML5**.

## Características
- **Búsqueda de Ciudades Inteligente**: Autocompletado, sugerencias en tiempo real (Geocoding API) y validación dinámica.
- **Panel Meteorológico Avanzado**: Visualización detallada de temperatura, descripción atmosférica con iconos, sensación térmica, índice UV, humedad y viento.
- **Pronóstico en Tiempo Real**: Visualización predictiva para las próximas 12 horas con gráficos de tendencias SVG y análisis nocturno.
- **Gestión de Favoritos en la Nube**: Sistema de persistencia para guardar y sincronizar ciudades favoritas vinculadas a la cuenta del usuario.
- **Tematización Dinámica (Light/Dark Mode)**: Interfaz adaptable con variables de diseño personalizadas y sincronización directa con la base de datos.
- **Internacionalización Integral**: Soporte nativo y dinámico entre Español e Inglés para toda la plataforma.
- **Portal de Acceso Seguro**: Registro, inicio de sesión y gestión de perfiles con protección de credenciales de grado industrial.

## Tecnologías utilizadas
- **Frontend Logic**: JavaScript Vanilla (ES6+) con manipulación asíncrona avanzada.
- **Maquetación y Estilos**: HTML5 semántico y CSS3 nativo (Arquitectura basada en componentes y variables CSS, diseño Mobile First).
- **Backend y API**: Next.js API Routes (Node.js) para el manejo de lógica del servidor y endpoints REST.
- **Base de Datos**: TiDB Cloud (escalabilidad distribuida, compatible con MySQL).
- **Seguridad y Sesiones**: JWT, bcryptjs para hashing y cookies HttpOnly.
- **Servicios Externos**: Open-Meteo API.
- **Despliegue y CI/CD**: Vercel.

## Estructura del proyecto
```text
WebApp del tiempo/
├── app/api/                  # Endpoints del backend (Auth, Sync, Config, Profile)
├── lib/                      # Conexión a Base de Datos (TiDB) y middleware de seguridad
├── legacy_public/            # Cliente Frontend (SPA Vanilla JS)
│   ├── assets/
│   │   ├── css/              # Sistema de diseño, variables de color y estilos de componentes
│   │   └── js/               # Lógica del cliente y orquestación de la API
│   ├── index.html            # Interfaz principal (Dashboard del Clima)
│   └── login.html            # Portal de autenticación segura
├── vercel.json               # Configuración de despliegue y ruteo
└── package.json              # Dependencias del servidor y scripts de construcción
```

## Habilidades demostradas
Este proyecto refleja competencias críticas requeridas en entornos tecnológicos de alto rendimiento:

- **Ingeniería Frontend**: Manipulación limpia y eficiente del DOM, optimización de renderizado, y estructuración de código sin depender de frameworks (Reactivity from scratch).
- **Diseño de UI/UX y CSS Avanzado**: Implementación de interfaces premium, animaciones fluidas (micro-interacciones) y layouts complejos totalmente responsivos.
- **Arquitectura Backend y Bases de Datos**: Integración con bases de datos en la nube (TiDB Serverless), modelado de datos y endpoints escalables.
- **Seguridad Informática**: Implementación de controles de acceso estandarizados, protección contra inyecciones y gestión segura de sesiones de usuario.
- **Integración y Despliegue**: Gestión de entornos de producción y configuraciones de Serverless Functions (Vercel).

## Demo en vivo
*(Próximamente disponible / Enlace a desplegar)*

## Notas para empleadores y Clientes
Este proyecto es una muestra transparente de la capacidad para diseñar, construir y desplegar aplicaciones completas de principio a fin (End-to-End). La decisión técnica de construir el frontend completamente "desde cero" (sin React, Angular o Vue) demuestra un entendimiento sólido y fundamental de la ingeniería web, esencial para resolver problemas arquitectónicos complejos que las abstracciones modernas a menudo ocultan.

Estoy plenamente preparado para integrarme a equipos de alto rendimiento, aportar visión técnica, y construir soluciones de software de grado empresarial.

---

## Contacto
- **GitHub**: [github.com/JesusBustos12](https://github.com/JesusBustos12)
- **LinkedIn**: [linkedin.com/in/jesus-bustos-arizmendi-325329283](https://linkedin.com/in/jesus-bustos-arizmendi-325329283)
- **Correo**: jesusbustosarizmendi0@gmail.com
- **Celular/WhatsApp**: +52 762 119 2732

¡Gracias por revisar mi trabajo! 🚀
