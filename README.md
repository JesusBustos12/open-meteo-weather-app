# WebApp del tiempo - Portafolio Frontend

## Descripción
**WebApp del tiempo** es una aplicación web interactiva que permite a los usuarios consultar el pronóstico del tiempo de diversas ciudades del mundo en tiempo real. La aplicación muestra el estado actual y una previsión para las próximas 12 horas, comunicándose con la API externa de Open-Meteo.

El proyecto destaca por su enfoque en el desarrollo nativo, prescindiendo de frameworks tanto en el diseño como en la lógica (Vanilla JS y CSS puro). Además, implementa un sistema de persistencia de datos mediante `localStorage` para gestionar búsquedas, favoritos y preferencias de usuario, ofreciendo una experiencia fluida y de alto rendimiento.

## Objetivo
Como desarrollador enfocado en dominar las bases del desarrollo web, creé este proyecto para:

- Demostrar dominio avanzado de **JavaScript Vanilla** sin dependencia de librerías ni frameworks.
- Implementar maquetación moderna y responsiva utilizando **CSS3 Nativo** (Grid, Flexbox).
- Gestionar el estado y la persistencia de datos del lado del cliente utilizando exclusivamente **localStorage**.
- Consumir APIs externas de forma asíncrona (`fetch`) y procesar los datos para actualizar el DOM dinámicamente.
- Aplicar buenas prácticas de accesibilidad y semántica en **HTML5**.
- Garantizar la manipulación segura del DOM (evitando el uso de `innerHTML` y priorizando `createElement` y `appendChild`).

## Características
- **Búsqueda de Ciudades**: Input inteligente con sugerencias en tiempo real y validación de existencia.
- **Clima Actual**: Visualización detallada de temperatura, descripción del clima con iconos representativos, sensación térmica, humedad y velocidad del viento.
- **Pronóstico por Horas**: Detalle del clima para las próximas 12 horas.
- **Localidades Guardadas**: Sistema para guardar y eliminar ciudades favoritas en una lista, evitando duplicados.
- **Tema Personalizable**: Interruptor con efecto deslizante para cambiar entre tema claro y oscuro (con persistencia).
- **Internacionalización**: Soporte para cambio de idioma entre Español e Inglés (con persistencia).
- **Gestión de Perfil**: Secciones dedicadas para editar el perfil de usuario y cerrar sesión.

## Tecnologías utilizadas
- **Maquetación**: HTML5 semántico.
- **Estilos**: CSS3 nativo (sin frameworks como Tailwind), uso de variables CSS y unidades `rem` basadas en un tamaño base de 10px.
- **Lógica**: JavaScript Vanilla (ES6+).
- **API**: Open-Meteo API (sin autenticación).
- **Almacenamiento**: LocalStorage para persistencia de datos.

## Estructura del proyecto
```text
WebApp del tiempo/
├── Carpeta (Proyect)/        # Recursos de diseño y arquitectura inicial
│   ├── Carpeta (Html)/
│   └── Carpeta (Imgs)/
├── public/                    # Archivos públicos de la aplicación
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css    # Estilos globales y variables
│   │   ├── Img/              # Imágenes y recursos visuales
│   │   └── js/
│   │       └── main.js       # Lógica principal de la aplicación
│   └── index.html            # Punto de entrada de la aplicación
└── Agents.md                 # Reglas y especificaciones del proyecto
```

## Habilidades demostradas
Este proyecto refleja competencias clave en el desarrollo Frontend:

- **Manipulación limpia del DOM**: Creación de elementos de forma segura y manejo de eventos previniendo comportamientos por defecto.
- **CSS Avanzado**: Diseño responsivo y adaptable (Mobile First), uso de Grid y Flexbox para layouts complejos sin frameworks.
- **Manejo de Estado y Persistencia**: Simulación de persistencia de sesión y preferencias del usuario usando la API de LocalStorage.
- **Integración de APIs**: Comunicación asíncrona efectiva con servicios externos.

## Demo en vivo
*(Próximamente disponible / Enlace a desplegar)*

## Notas para empleadores y Clientes
Este proyecto demuestra mi capacidad para construir una aplicación web interactiva completa desde cero, preocupándome por la usabilidad, el rendimiento y las buenas prácticas de desarrollo sin depender de librerías externas.

Estoy 100% listo para aportar valor real en un equipo como **Frontend Developer** o **Junior Full-Stack Developer**.

---

## Contacto
- **GitHub**: [github.com/JesusBustos12](https://github.com/JesusBustos12)
- **LinkedIn**: [linkedin.com/in/jesus-bustos-arizmendi-325329283](https://linkedin.com/in/jesus-bustos-arizmendi-325329283)
- **Correo**: jesusbustosarizmendi0@gmail.com
- **Celular/WhatsApp**: +52 762 119 2732

¡Gracias por revisar mi trabajo! 🚀
