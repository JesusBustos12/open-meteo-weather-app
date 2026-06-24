/* =====================================================
   WEATHERAPP — main.js
   Vanilla JavaScript · Sin dependencias externas
   ===================================================== */
'use strict';

/* =====================================================
   CONSTANTES Y CONFIG
   ===================================================== */
const API_METEO = '/api/weather';
const API_GEO = '/api/geocoding';
const LS_CIUDADES = 'wa_ciudades';
const LS_TEMA = 'wa_tema';
/* LS_IDIOMA definido en i18n.js */
const LS_PERFIL = 'wa_perfil';
const LS_ULTIMA = 'wa_ultima_busqueda';
const LS_SESION = 'wa_sesion';

/* Códigos WMO → descripción e icono */
const CODIGOS_CLIMA = {
  0: { es: 'Despejado', en: 'Clear sky', icono: '☀️', msIcon: 'sunny' },
  1: { es: 'Principalmente despejado', en: 'Mainly clear', icono: '🌤️', msIcon: 'partly_cloudy_day' },
  2: { es: 'Parcialmente nublado', en: 'Partly cloudy', icono: '⛅', msIcon: 'partly_cloudy_day' },
  3: { es: 'Nublado', en: 'Overcast', icono: '☁️', msIcon: 'cloud' },
  45: { es: 'Niebla', en: 'Fog', icono: '🌫️', msIcon: 'foggy' },
  48: { es: 'Niebla con escarcha', en: 'Icy fog', icono: '🌫️', msIcon: 'foggy' },
  51: { es: 'Llovizna ligera', en: 'Light drizzle', icono: '🌦️', msIcon: 'rainy' },
  53: { es: 'Llovizna moderada', en: 'Moderate drizzle', icono: '🌦️', msIcon: 'rainy' },
  55: { es: 'Llovizna intensa', en: 'Dense drizzle', icono: '🌧️', msIcon: 'rainy' },
  61: { es: 'Lluvia ligera', en: 'Light rain', icono: '🌧️', msIcon: 'rainy' },
  63: { es: 'Lluvia moderada', en: 'Moderate rain', icono: '🌧️', msIcon: 'rainy' },
  65: { es: 'Lluvia intensa', en: 'Heavy rain', icono: '🌧️', msIcon: 'rainy' },
  71: { es: 'Nevada ligera', en: 'Light snow', icono: '🌨️', msIcon: 'ac_unit' },
  73: { es: 'Nevada moderada', en: 'Moderate snow', icono: '❄️', msIcon: 'ac_unit' },
  75: { es: 'Nevada intensa', en: 'Heavy snow', icono: '❄️', msIcon: 'ac_unit' },
  77: { es: 'Granizo', en: 'Hail', icono: '🌨️', msIcon: 'weather_hail' },
  80: { es: 'Chubascos ligeros', en: 'Light showers', icono: '🌦️', msIcon: 'rainy' },
  81: { es: 'Chubascos', en: 'Showers', icono: '🌧️', msIcon: 'rainy' },
  82: { es: 'Chubascos intensos', en: 'Heavy showers', icono: '⛈️', msIcon: 'thunderstorm' },
  85: { es: 'Chubascos de nieve', en: 'Snow showers', icono: '🌨️', msIcon: 'ac_unit' },
  86: { es: 'Chubascos intensos de nieve', en: 'Heavy snow showers', icono: '❄️', msIcon: 'ac_unit' },
  95: { es: 'Tormenta eléctrica', en: 'Thunderstorm', icono: '⛈️', msIcon: 'thunderstorm' },
  96: { es: 'Tormenta con granizo', en: 'T-storm with hail', icono: '⛈️', msIcon: 'thunderstorm' },
  99: { es: 'Tormenta intensa', en: 'Heavy thunderstorm', icono: '⛈️', msIcon: 'thunderstorm' },
};

/* Traducciones: ver i18n.js (archivo compartido con login) */

/* =====================================================
   ESTADO
   ===================================================== */
const estado = {
  idioma: obtenerIdiomaActual(),
  tema: 'dark',
  ciudadesGuardadas: [],
  perfil: { nombre: '', avatar: '' },
  ultimaBusqueda: null,
  sugerenciasActivas: [],
  timerSugerencias: null,
  ultimosHourly: null,   // guardamos hourly para re-renderizar con idioma
  indiceSugerencia: -1,  // Índice para navegación por teclado en resultados
  errorActivo: false,    // Estado de error global
};

/* =====================================================
   TELEMETRÍA Y LOGGING
   ===================================================== */
const AppLogger = {
  logs: [],
  error(modulo, error, contexto = {}) {
    const entrada = {
      timestamp: new Date().toISOString(),
      modulo,
      error: error.message || error,
      contexto,
      userAgent: navigator.userAgent
    };
    this.logs.push(entrada);
    
    console.group(`%c[ERROR]: ${modulo}`, 'color: #ff4444; font-weight: bold;');
    console.error('Detalles:', error);
    console.table(contexto);
    console.groupEnd();

    // Simular envío a endpoint de telemetría (Sentry/LogRocket/etc)
    this._enviarTelemetria(entrada);
  },
  _enviarTelemetria(data) {
    // En un entorno real: fetch('/api/logs', { method: 'POST', body: JSON.stringify(data) })
    // Por ahora, solo guardamos un rastro en localStorage de forma limitada
    try {
      const historial = JSON.parse(localStorage.getItem('wa_telemetria')) || [];
      historial.push(data);
      localStorage.setItem('wa_telemetria', JSON.stringify(historial.slice(-10))); // Solo últimos 10
    } catch (e) {}
  }
};

/* =====================================================
   REFERENCIAS DOM
   ===================================================== */
const dom = {};

function cachearDOM() {
  dom.html = document.documentElement;
  dom.sidebar = document.getElementById('sidebar');
  dom.sidebarOverlay = document.getElementById('sidebar-overlay');
  dom.btnMenuMovil = document.getElementById('btn-menu-movil');

  dom.formBuscador = document.getElementById('form-buscador');
  dom.buscadorInput = document.getElementById('buscador-input');
  dom.buscadorHint = document.getElementById('buscador-hint');
  dom.btnBuscar = document.getElementById('btn-buscar');
  dom.sugerenciasLista = document.getElementById('sugerencias-lista');
  dom.buscadorError = document.getElementById('buscador-error');
  dom.buscadorErrorMsg = document.getElementById('buscador-error-msg');

  dom.toggleTema = document.getElementById('toggle-tema');
  dom.btnIdiomaEs = document.getElementById('btn-idioma-es');
  dom.btnIdiomaEn = document.getElementById('btn-idioma-en');

  // Zona 1
  dom.estadoInicial = document.getElementById('estado-inicial');
  dom.loader = document.getElementById('loader');
  dom.climaTarjetas = document.getElementById('clima-tarjetas');
  dom.climaSkeleton = document.getElementById('clima-skeleton');
  dom.globalError = document.getElementById('global-error');
  dom.globalErrorMsg = document.getElementById('global-error-msg');
  dom.btnReintentarGlobal = document.getElementById('btn-reintentar-global');

  // Zona 1 — Cabecera y Métricas
  dom.ciudadNombre = document.getElementById('ciudad-nombre');
  dom.ciudadRegion = document.getElementById('ciudad-region');
  dom.badgeEstacion = document.getElementById('badge-estacion');
  dom.climaTemp = document.getElementById('clima-temp');
  dom.climaDescTexto = document.getElementById('clima-descripcion-texto');
  dom.climaSensacion = document.getElementById('clima-sensacion');
  dom.climaDelta = document.getElementById('clima-delta');
  dom.climaHumedad = document.getElementById('clima-humedad');
  dom.humedadBarra = document.getElementById('humedad-barra');
  dom.climaViento = document.getElementById('clima-viento');
  dom.vientoDir = document.getElementById('viento-dir');
  dom.vientoEstado = document.getElementById('viento-estado');

  dom.tablaHorasWrapper = document.getElementById('tabla-horas-wrapper');
  dom.tablaHorasSkeleton = document.getElementById('tabla-horas-skeleton');
  dom.tablaHorasContenido = document.getElementById('tabla-horas');
  dom.tablaHorasBody = document.getElementById('tabla-horas-body');
  dom.lateAnalysis = document.getElementById('late-analysis');
  dom.lateAnalysisLista = document.getElementById('late-analysis-lista');
  dom.feedbackGuardar = document.getElementById('feedback-guardar');
  dom.btnGuardarCiudad = document.getElementById('btn-guardar-ciudad');

  // Zona 2
  dom.tablaHorasBody = document.getElementById('tabla-horas-body');
  dom.tendenciaSvg = document.getElementById('tendencia-svg');
  dom.tendenciaPath = document.getElementById('tendencia-path');
  dom.tendenciaPuntos = document.getElementById('tendencia-puntos');
  dom.tendenciaEtiquetas = document.getElementById('tendencia-etiquetas');

  // Zona 3 (mapa)
  dom.mapaPresion = document.getElementById('mapa-presion');
  dom.mapaRocio = document.getElementById('mapa-rocio');
  dom.mapaVisibilidad = document.getElementById('mapa-visibilidad');

  // Localidades
  dom.localidadesLista = document.getElementById('localidades-lista');

  // Perfil (sidebar)
  dom.perfilAvatar = document.getElementById('perfil-avatar');
  dom.perfilNombre = document.getElementById('perfil-nombre');
  dom.btnEditarPerfil = document.getElementById('btn-editar-perfil');

  // Perfil (header)
  dom.headerPerfilNombre = document.getElementById('header-perfil-nombre');
  dom.headerPerfilAvatar = document.getElementById('header-perfil-avatar');
  dom.headerPerfilIniciales = document.getElementById('header-perfil-iniciales');

  // Modal perfil
  dom.modalPerfil = document.getElementById('modal-perfil');
  dom.btnCerrarModal = document.getElementById('btn-cerrar-modal-perfil');
  dom.formPerfil = document.getElementById('form-perfil');
  dom.inputNombre = document.getElementById('perfil-input-nombre');
  dom.inputEmail = document.getElementById('perfil-input-email');
  dom.inputPass = document.getElementById('perfil-input-pass');
  dom.ojoPass = document.getElementById('perfil-ojo-pass');
  dom.inputAvatar = document.getElementById('perfil-input-avatar');
  dom.inputFile = document.getElementById('perfil-input-file');
  dom.archivoNombre = document.getElementById('perfil-archivo-nombre');
  dom.avatarPreview = document.getElementById('avatar-preview');
  dom.avatarPreviewImg = document.getElementById('avatar-preview-img');
  dom.perfilFeedback = document.getElementById('perfil-feedback');
  dom.btnCancelarPerfil = document.getElementById('btn-cancelar-perfil');

  // Cerrar sesión
  dom.btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
}

/* =====================================================
   UTILIDADES
   ===================================================== */
/* t() definida en i18n.js */

function infoClima(codigoWMO) {
  return CODIGOS_CLIMA[codigoWMO] || { es: '—', en: '—', icono: '🌡️', msIcon: 'device_thermostat' };
}

function formatearHora(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString(estado.idioma === 'es' ? 'es-MX' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function lsGet(clave) {
  try { return JSON.parse(localStorage.getItem(clave)); } catch { return null; }
}
function lsSet(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* silencioso */ }
}

function mostrar(el) { if (el) el.hidden = false; }
function ocultar(el) { if (el) el.hidden = true; }
function limpiarHijos(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }

/* Obtener iniciales de un nombre */
function obtenerIniciales(nombre) {
  if (!nombre) return 'U';
  return nombre.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

/* =====================================================
   IDIOMA
   ===================================================== */
function aplicarIdioma() {
  /* Usar sistema compartido de i18n.js */
  aplicarTraducciones();
  dom.html.lang = estado.idioma;

  /* Botones idioma */
  dom.btnIdiomaEs.setAttribute('aria-pressed', estado.idioma === 'es' ? 'true' : 'false');
  dom.btnIdiomaEs.classList.toggle('activo', estado.idioma === 'es');
  dom.btnIdiomaEn.setAttribute('aria-pressed', estado.idioma === 'en' ? 'true' : 'false');
  dom.btnIdiomaEn.classList.toggle('activo', estado.idioma === 'en');
}

async function cambiarIdioma(nuevoIdioma) {
  if (estado.idioma === nuevoIdioma) return;
  
  cambiarIdiomaGlobal(nuevoIdioma); // actualiza localStorage y i18n
  estado.idioma = nuevoIdioma;
  aplicarIdioma();
  
  // Re-renderizar con el nuevo idioma
  if (estado.ultimosHourly) {
    renderizarHourly(estado.ultimosHourly);
  }
  
  try {
    await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: nuevoIdioma })
    });
  } catch (err) {
    console.error('Error al guardar idioma en DB:', err);
  }
}

function actualizarTextosClima() {
  /* Actualiza descripciones sin recargar API */
  dom.tablaHorasBody.querySelectorAll('[data-wmo]').forEach(celda => {
    const codigo = parseInt(celda.dataset.wmo, 10);
    const span = celda.querySelector('.fila-estado__texto');
    if (span) span.textContent = infoClima(codigo)[estado.idioma];
  });
  if (dom.climaDescTexto.dataset.wmo) {
    const codigo = parseInt(dom.climaDescTexto.dataset.wmo, 10);
    dom.climaDescTexto.textContent = infoClima(codigo)[estado.idioma];
  }
}

/* =====================================================
   TEMA
   ===================================================== */
function aplicarTema() {
  dom.html.dataset.theme = estado.tema;
  dom.toggleTema.checked = estado.tema === 'dark';
  dom.toggleTema.setAttribute('aria-checked', dom.toggleTema.checked);
}

async function cambiarTema(esDark) {
  estado.tema = esDark ? 'dark' : 'light';
  aplicarTema();
  
  try {
    await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: estado.tema })
    });
  } catch (err) {
    console.error('Error al guardar tema en DB:', err);
  }
}

/* =====================================================
   PERFIL
   ===================================================== */

function cargarPerfil() {
  renderizarPerfil();
}

function renderizarPerfil() {
  const { nombre, avatar } = estado.perfil;
  const nombreMostrar = nombre || t('perfil_nombre');

  /* Sidebar */
  if (dom.perfilNombre) dom.perfilNombre.textContent = nombreMostrar;
  if (dom.perfilAvatar) {
    limpiarHijos(dom.perfilAvatar);
    _setAvatar(dom.perfilAvatar, avatar, nombre);
  }

  /* Header */
  dom.headerPerfilNombre.textContent = nombreMostrar;
  limpiarHijos(dom.headerPerfilAvatar);
  if (avatar) {
    const img = document.createElement('img');
    img.src = avatar;
    img.alt = nombreMostrar;
    img.addEventListener('error', () => {
      limpiarHijos(dom.headerPerfilAvatar);
      dom.headerPerfilIniciales = document.createElement('span');
      dom.headerPerfilIniciales.id = 'header-perfil-iniciales';
      dom.headerPerfilIniciales.textContent = obtenerIniciales(nombre);
      dom.headerPerfilAvatar.appendChild(dom.headerPerfilIniciales);
    });
    dom.headerPerfilAvatar.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.id = 'header-perfil-iniciales';
    span.textContent = obtenerIniciales(nombre);
    dom.headerPerfilAvatar.appendChild(span);
  }
}

function _setAvatar(contenedor, avatar, nombre) {
  if (avatar) {
    const img = document.createElement('img');
    img.src = avatar;
    img.alt = nombre || 'Avatar';
    img.addEventListener('error', () => {
      limpiarHijos(contenedor);
      const ic = document.createElement('span');
      ic.classList.add('material-symbols-outlined');
      ic.textContent = 'account_circle';
      contenedor.appendChild(ic);
    });
    contenedor.appendChild(img);
  } else {
    const ic = document.createElement('span');
    ic.classList.add('material-symbols-outlined');
    ic.textContent = 'account_circle';
    contenedor.appendChild(ic);
  }
}

function abrirModalPerfil() {
  // Cargar datos del perfil
  dom.inputNombre.value = estado.perfil.nombre;
  dom.inputAvatar.value = estado.perfil.avatar;
  actualizarPreviewAvatar(estado.perfil.avatar);

  dom.inputEmail.value = estado.perfil.email || '';
  dom.inputPass.value = '';

  if (dom.archivoNombre) dom.archivoNombre.textContent = '';
  ocultar(dom.perfilFeedback);
  mostrar(dom.modalPerfil);
  
  // Guardamos el elemento que tenía el foco para devolverlo al cerrar
  estado.elementoPrevioFoco = document.activeElement;
  
  // Pequeño delay para asegurar que el modal es visible antes de enfocar
  setTimeout(() => dom.inputNombre.focus(), 50);
}

function cerrarModalPerfil() { 
  ocultar(dom.modalPerfil); 
  // Devolver foco al botón original
  if (estado.elementoPrevioFoco) {
    estado.elementoPrevioFoco.focus();
  }
}

function actualizarPreviewAvatar(url) {
  if (url) {
    dom.avatarPreviewImg.src = url;
    mostrar(dom.avatarPreviewImg);
    dom.avatarPreview.querySelectorAll('.material-symbols-outlined').forEach(ic => ocultar(ic));
  } else {
    ocultar(dom.avatarPreviewImg);
    dom.avatarPreview.querySelectorAll('.material-symbols-outlined').forEach(ic => mostrar(ic));
  }
}

async function guardarPerfil(e) {
  e.preventDefault();
  const nombre = dom.inputNombre.value.trim();
  const avatar = dom.inputAvatar.value.trim();
  const emailNuevo = dom.inputEmail.value.trim();
  const passNuevo = dom.inputPass.value;

  try {
    const dataToSend = {
        name: nombre,
        avatar_url: avatar
    };
    
    // Si se escribió un email o password nuevo, enviarlos
    if (emailNuevo) dataToSend.email = emailNuevo;
    if (passNuevo) dataToSend.password = passNuevo;

    const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    });

    const data = await res.json();
    
    if (!res.ok) {
        mostrarFeedbackModal(data.error || 'Error al actualizar perfil', 'error');
        return;
    }

    // Actualizar perfil local tras éxito
    estado.perfil = { nombre, avatar };
    renderizarPerfil();

    mostrarFeedbackModal(t('perfil_guardado'), 'exito');
    setTimeout(cerrarModalPerfil, 1200);

  } catch (err) {
    console.error('Error actualizando perfil:', err);
    mostrarFeedbackModal('Error de conexión', 'error');
  }
}

function mostrarFeedbackModal(msg, tipo) {
  dom.perfilFeedback.textContent = msg;
  dom.perfilFeedback.className = 'form-grupo__feedback feedback-msg--' + tipo;
  mostrar(dom.perfilFeedback);
}

/* =====================================================
   BUSCADOR
   ===================================================== */
let debounceTimer = null;

function manejarInputBuscador() {
  const q = dom.buscadorInput.value.trim();
  actualizarHint(null); // Limpiar hint previo
  ocultarErrorBuscador();
  if (debounceTimer) clearTimeout(debounceTimer);
  if (q.length < 2) { cerrarSugerencias(); return; }
  debounceTimer = setTimeout(() => fetchSugerencias(q), 300);
}

async function fetchSugerencias(q) {
  try {
    const url = new URL(API_GEO, window.location.origin);
    url.searchParams.set('name', q);
    url.searchParams.set('count', '6');
    url.searchParams.set('language', estado.idioma);
    url.searchParams.set('format', 'json');
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    
    const data = await resp.json();
    estado.sugerenciasActivas = data.results || [];
    renderizarSugerencias(estado.sugerenciasActivas);
  } catch (err) {
    console.error('[ERROR]: Buscador:FetchSugerencias:', err);
    cerrarSugerencias();
  }
}

function renderizarSugerencias(resultados) {
  limpiarHijos(dom.sugerenciasLista);
  if (!resultados.length) { cerrarSugerencias(); return; }
  
  // Autocomplete: Tomar el primero como base para el hint
  actualizarHint(resultados[0]);

  resultados.forEach((res, idx) => {
    const li = document.createElement('li');
    li.classList.add('sugerencia-item');
    li.setAttribute('role', 'option');
    li.setAttribute('id', 'sug-' + idx);
    li.dataset.lat = res.latitude;
    li.dataset.lon = res.longitude;
    li.dataset.ciudad = res.name;
    li.dataset.region = [res.admin1, res.country].filter(Boolean).join(', ');

    const icono = document.createElement('span');
    icono.classList.add('material-symbols-outlined');
    icono.textContent = 'location_on';
    icono.setAttribute('aria-hidden', 'true');

    const texto = document.createElement('span');
    texto.textContent = [res.name, res.admin1, res.country].filter(Boolean).join(', ');

    li.appendChild(icono);
    li.appendChild(texto);
    li.addEventListener('click', () => seleccionarSugerencia(li));
    dom.sugerenciasLista.appendChild(li);
  });
  mostrar(dom.sugerenciasLista);
  dom.buscadorInput.setAttribute('aria-expanded', 'true');
  estado.indiceSugerencia = -1; // Reset al mostrar nuevas sugerencias
}

function seleccionarSugerencia(li) {
  const ciudad = li.dataset.ciudad;
  const region = li.dataset.region;
  const lat = parseFloat(li.dataset.lat);
  const lon = parseFloat(li.dataset.lon);
  dom.buscadorInput.value = [ciudad, region].filter(Boolean).join(', ');
  cerrarSugerencias();
  cargarClima({ ciudad, region, lat, lon });
}

function cerrarSugerencias() {
  limpiarHijos(dom.sugerenciasLista);
  ocultar(dom.sugerenciasLista);
  actualizarHint(null);
  dom.buscadorInput.setAttribute('aria-expanded', 'false');
  dom.buscadorInput.removeAttribute('aria-activedescendant');
  estado.sugerenciasActivas = [];
  estado.indiceSugerencia = -1;
}

function manejarKeydownBuscador(e) {
  const items = dom.sugerenciasLista.querySelectorAll('.sugerencia-item');
  const hasHint = dom.buscadorHint && dom.buscadorHint.value;

  if (e.key === 'Escape') {
    e.preventDefault();
    cerrarSugerencias();
    dom.buscadorInput.blur();
    return;
  }

  // Aceptar el "Ghost Text" o hint con Tab o Flecha Derecha
  if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'End') && hasHint) {
    // Solo si el cursor está al final del texto para no molestar la edición
    if (dom.buscadorInput.selectionStart === dom.buscadorInput.value.length) {
      e.preventDefault();
      dom.buscadorInput.value = dom.buscadorHint.value;
      actualizarHint(null);
      // Opcionalmente: disparar búsqueda o dejar que el usuario presione Enter
    }
  }

  if (!dom.sugerenciasLista.hidden && items.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      estado.indiceSugerencia = (estado.indiceSugerencia + 1) % items.length;
      actualizarSugerenciaActiva(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      estado.indiceSugerencia = (estado.indiceSugerencia - 1 + items.length) % items.length;
      actualizarSugerenciaActiva(items);
    } else if (e.key === 'Enter' && estado.indiceSugerencia >= 0) {
      e.preventDefault();
      seleccionarSugerencia(items[estado.indiceSugerencia]);
    }
  }
}

function actualizarSugerenciaActiva(items) {
  items.forEach((item, idx) => {
    if (idx === estado.indiceSugerencia) {
      item.classList.add('sugerencia-item--activo');
      dom.buscadorInput.setAttribute('aria-activedescendant', item.id);
      // Asegurarse de que el elemento sea visible si hay scroll
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('sugerencia-item--activo');
    }
  });
}

/**
 * Lógica de Autocomplete Ghost Text
 */
function actualizarHint(resultado) {
  if (!dom.buscadorHint) return;
  
  if (!resultado || !dom.buscadorInput.value) {
    dom.buscadorHint.value = '';
    return;
  }

  const query = dom.buscadorInput.value;
  // Construir nombre completo igual que en la lista
  const sugerenciaCompleta = [resultado.name, resultado.admin1, resultado.country]
    .filter(Boolean)
    .join(', ');

  // Solo mostrar si el inicio coincide exactamente (case insensitive)
  if (sugerenciaCompleta.toLowerCase().startsWith(query.toLowerCase())) {
    // IMPORTANTE: Mantener el mismo casing que el usuario para la parte ya escrita
    // El resto viene de la sugerencia
    dom.buscadorHint.value = query + sugerenciaCompleta.slice(query.length);
  } else {
    dom.buscadorHint.value = '';
  }
}

function manejarSubmitBuscador(e) {
  e.preventDefault();
  const q = dom.buscadorInput.value.trim();
  if (q.length < 2) { mostrarErrorBuscador(t('ciudad_no_encontrada')); return; }
  cerrarSugerencias();
  if (estado.sugerenciasActivas.length) {
    const primera = estado.sugerenciasActivas[0];
    cargarClima({
      ciudad: primera.name,
      region: [primera.admin1, primera.country].filter(Boolean).join(', '),
      lat: primera.latitude,
      lon: primera.longitude,
    });
  } else {
    buscarPorNombre(q);
  }
}

async function buscarPorNombre(nombre) {
  try {
    mostrarLoader();
    const url = new URL(API_GEO, window.location.origin);
    url.searchParams.set('name', nombre);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', estado.idioma);
    url.searchParams.set('format', 'json');
    const resp = await fetch(url);
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    if (!data.results?.length) {
      ocultarLoader();
      mostrarErrorBuscador(t('ciudad_no_encontrada'));
      return;
    }
    const r = data.results[0];
    cargarClima({
      ciudad: r.name,
      region: [r.admin1, r.country].filter(Boolean).join(', '),
      lat: r.latitude,
      lon: r.longitude,
    });
  } catch (err) {
    manejarErrorGlobal(err, 'Buscador:Geocoding');
  }
}

function mostrarErrorBuscador(msg) {
  dom.buscadorErrorMsg.textContent = msg;
  mostrar(dom.buscadorError);
  setTimeout(ocultarErrorBuscador, 4000);
}
function ocultarErrorBuscador() { ocultar(dom.buscadorError); }

/* =====================================================
   API CLIMA
   ===================================================== */
async function cargarClima({ ciudad, region, lat, lon }) {
  mostrarLoader();
  ocultarErrorBuscador();
  try {
    const url = new URL(API_METEO, window.location.origin);
    url.searchParams.set('latitude', lat);
    url.searchParams.set('longitude', lon);
    url.searchParams.set('current', [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
    ].join(','));
    url.searchParams.set('hourly', [
      'temperature_2m',
      'weather_code',
      'precipitation_probability',
      'uv_index',
    ].join(','));
    url.searchParams.set('forecast_days', '2');
    url.searchParams.set('timezone', 'auto');

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Error API');
    const data = await resp.json();

    estado.ultimaBusqueda = { ciudad, region, lat, lon };
    lsSet(LS_ULTIMA, estado.ultimaBusqueda);
    estado.ultimosHourly = data.hourly;

    ocultarLoader();
    dom.loader.removeAttribute('aria-busy');

    mostrarWorkspace();
    renderizarClimaActual(ciudad, region, data.current);
    renderizarClimaHoras(data.hourly);

    // Navegar el mapa a la ciudad buscada
    mapaNavegar(lat, lon, `${ciudad}, ${region}`);

    // Pasar temperatura a la capa térmica
    mapaSetTemperatura(Math.round(data.current.temperature_2m));
  } catch (err) {
    manejarErrorGlobal(err, 'API:Weather');
  }
}

/* =====================================================
   RENDERIZAR CLIMA ACTUAL (ZONA 1)
   ===================================================== */
function renderizarClimaActual(ciudad, region, current) {
  const codigo = current.weather_code;
  const info = infoClima(codigo);
  const temp = Math.round(current.temperature_2m);
  const sensacion = Math.round(current.apparent_temperature);
  const delta = sensacion - temp;

  /* Cabecera */
  dom.ciudadNombre.textContent = ciudad;
  dom.ciudadRegion.textContent = region;

  /* Badge */
  mostrar(dom.badgeEstacion);

  /* Temperatura */
  dom.climaTemp.textContent = temp;
  dom.climaDescTexto.textContent = info[estado.idioma];
  dom.climaDescTexto.dataset.wmo = codigo;

  /* Sensación + delta */
  dom.climaSensacion.textContent = sensacion;
  dom.climaDelta.textContent = `Delta: ${delta >= 0 ? '+' : ''}${delta}° Index`;

  /* Humedad */
  dom.climaHumedad.textContent = current.relative_humidity_2m;
  dom.humedadBarra.style.width = Math.min(100, current.relative_humidity_2m) + '%';

  /* Viento */
  dom.climaViento.textContent = Math.round(current.wind_speed_10m);
  dom.vientoDir.textContent = gradosADireccion(current.wind_direction_10m);

  /* Ocultar feedback */
  ocultar(dom.feedbackGuardar);

  /* Mostrar tarjetas */
  mostrar(dom.climaTarjetas);
  ocultar(dom.estadoInicial);
}

/* Convierte grados de viento a rosa de los vientos */
function gradosADireccion(deg) {
  if (deg === undefined || deg === null) return '—';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/* Nivel UV */
function nivelUV(uv) {
  if (uv <= 0) return 'None';
  if (uv <= 2) return `Low (${uv})`;
  if (uv <= 5) return `Mod (${uv})`;
  if (uv <= 7) return `High (${uv})`;
  return `V.High (${uv})`;
}

/* =====================================================
   RENDERIZAR PRONÓSTICO HORAS (ZONA 2)
   ===================================================== */
function renderizarClimaHoras(hourly) {
  const { time, temperature_2m, weather_code, precipitation_probability, uv_index } = hourly;
  const ahora = new Date();
  const horaActual = ahora.getHours();

  let indiceBase = time.findIndex(t => new Date(t).getHours() === horaActual);
  if (indiceBase < 0) indiceBase = 0;

  limpiarHijos(dom.tablaHorasBody);

  const horas = time.slice(indiceBase, indiceBase + 12);
  const temps = temperature_2m.slice(indiceBase, indiceBase + 12);
  const wmos = weather_code.slice(indiceBase, indiceBase + 12);
  const precips = (precipitation_probability || []).slice(indiceBase, indiceBase + 12);
  const uvs = (uv_index || []).slice(indiceBase, indiceBase + 12);

  const etiquetasHoras = [];

  horas.forEach((hora, i) => {
    const horaTexto = i === 0 ? t('ahora') : formatearHora(hora);
    etiquetasHoras.push(horaTexto);

    const tr = document.createElement('tr');
    const tdH = document.createElement('td');
    const tdE = document.createElement('td');
    const tdT = document.createElement('td');
    const tdP = document.createElement('td');
    const tdU = document.createElement('td');

    /* Tiempo */
    tdH.textContent = horaTexto;
    if (i === 0) tdH.classList.add('fila-ahora');

    /* Estado */
    const info = infoClima(wmos[i]);
    const divE = document.createElement('div');
    divE.classList.add('fila-estado');
    divE.dataset.wmo = wmos[i];

    const iconoSpan = document.createElement('span');
    iconoSpan.classList.add('material-symbols-outlined', 'fila-estado__icono');
    iconoSpan.textContent = info.msIcon || 'sunny';
    iconoSpan.setAttribute('aria-hidden', 'true');

    const textoSpan = document.createElement('span');
    textoSpan.classList.add('fila-estado__texto');
    textoSpan.textContent = info[estado.idioma];

    divE.appendChild(iconoSpan);
    divE.appendChild(textoSpan);
    tdE.appendChild(divE);

    /* Temp */
    tdT.textContent = Math.round(temps[i]) + '°C';
    tdT.classList.add('fila-temp');

    /* Precip */
    tdP.textContent = (precips[i] !== undefined ? precips[i] : 0) + '%';

    /* UV */
    tdU.textContent = nivelUV(uvs[i] !== undefined ? Math.round(uvs[i]) : 0);

    tr.appendChild(tdH);
    tr.appendChild(tdE);
    tr.appendChild(tdT);
    tr.appendChild(tdP);
    tr.appendChild(tdU);
    dom.tablaHorasBody.appendChild(tr);
  });

  /* Late Analysis — últimas 2 horas nocturnas del array */
  renderizarLateAnalysis(horas, temps, wmos);

  /* Tendencia SVG */
  dibujarTendencia(temps, etiquetasHoras);
}

/* Late Analysis (2 filas nocturnas) */
function renderizarLateAnalysis(horas, temps, wmos) {
  limpiarHijos(dom.lateAnalysisLista);
  /* Tomamos las últimas 2 horas del dataset */
  const total = horas.length;
  const items = [
    { hora: horas[total - 2], temp: temps[total - 2], wmo: wmos[total - 2] },
    { hora: horas[total - 1], temp: temps[total - 1], wmo: wmos[total - 1] },
  ];
  items.forEach(({ hora, temp, wmo }) => {
    const info = infoClima(wmo);
    const li = document.createElement('li');
    li.classList.add('late-analysis__item');

    const spanHora = document.createElement('span');
    spanHora.classList.add('late-analysis__hora');
    spanHora.textContent = formatearHora(hora);

    const spanIcono = document.createElement('span');
    spanIcono.classList.add('material-symbols-outlined', 'late-analysis__icono');
    spanIcono.setAttribute('aria-hidden', 'true');
    spanIcono.textContent = info.msIcon || 'nightlight_round';

    const spanTemp = document.createElement('span');
    spanTemp.classList.add('late-analysis__temp');
    spanTemp.textContent = Math.round(temp) + '°C';

    li.appendChild(spanHora);
    li.appendChild(spanIcono);
    li.appendChild(spanTemp);
    dom.lateAnalysisLista.appendChild(li);
  });
  mostrar(dom.lateAnalysis);
}

/* =====================================================
   TENDENCIA SVG
   ===================================================== */
function dibujarTendencia(temps, etiquetas) {
  if (!temps.length) return;
  const W = 400; const H = 80; const PAD = 6;
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const rango = max - min || 1;

  const puntos = temps.map((t, i) => {
    const x = PAD + (i / (temps.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((t - min) / rango) * (H - PAD * 2);
    return [x, y];
  });

  /* Path suavizado (bezier) */
  let d = `M ${puntos[0][0]} ${puntos[0][1]}`;
  for (let i = 1; i < puntos.length; i++) {
    const prev = puntos[i - 1];
    const curr = puntos[i];
    const cpx = (prev[0] + curr[0]) / 2;
    d += ` C ${cpx} ${prev[1]} ${cpx} ${curr[1]} ${curr[0]} ${curr[1]}`;
  }
  dom.tendenciaPath.setAttribute('d', d);

  /* Puntos en el SVG */
  limpiarHijos(dom.tendenciaPuntos);
  puntos.forEach(([x, y], i) => {
    if (i % 3 !== 0 && i !== puntos.length - 1) return;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '3');
    circle.classList.add('tendencia__punto');
    dom.tendenciaPuntos.appendChild(circle);
  });

  /* Etiquetas de hora */
  limpiarHijos(dom.tendenciaEtiquetas);
  etiquetas.forEach((h, i) => {
    if (i % 3 !== 0 && i !== etiquetas.length - 1) return;
    const span = document.createElement('span');
    span.textContent = h;
    dom.tendenciaEtiquetas.appendChild(span);
  });
}

/* =====================================================
   ESTADOS UI
   ===================================================== */
function mostrarLoader() {
  estado.errorActivo = false;
  ocultar(dom.estadoInicial);
  ocultar(dom.climaTarjetas);
  ocultar(dom.lateAnalysis);
  ocultar(dom.badgeEstacion);
  ocultar(dom.globalError);
  
  // Mostrar Skeletons
  mostrar(dom.climaSkeleton);
  mostrar(dom.tablaHorasSkeleton);
  ocultar(dom.tablaHorasContenido);
  
  // Mostrar spinner tradicional para compatibilidad
  mostrar(dom.loader);
}

function ocultarLoader() { 
  ocultar(dom.loader);
  ocultar(dom.climaSkeleton);
  ocultar(dom.tablaHorasSkeleton);
  mostrar(dom.tablaHorasContenido);
}

function mostrarWorkspace() {
  ocultar(dom.estadoInicial);
  ocultar(dom.loader);
  ocultar(dom.globalError);
}

/** Maneja errores críticos que impiden el uso de la app */
function manejarErrorGlobal(error, contexto = 'General') {
  estado.errorActivo = true;
  AppLogger.error(`Global:${contexto}`, error);

  ocultarLoader();
  ocultar(dom.estadoInicial);
  ocultar(dom.climaTarjetas);
  ocultar(dom.lateAnalysis);
  ocultar(dom.badgeEstacion);

  // Determinar mensaje (si es error de red o de servidor)
  const esRed = !navigator.onLine || error.message?.includes('network') || error.message?.includes('fetch');
  dom.globalErrorMsg.textContent = esRed ? t('error_desc') : t('error_generico');
  
  mostrar(dom.globalError);
}

/* =====================================================
   LOCALIDADES GUARDADAS
   ===================================================== */
function cargarCiudadesGuardadas() {
  const guardadas = lsGet(LS_CIUDADES);
  estado.ciudadesGuardadas = Array.isArray(guardadas) ? guardadas : [];
  renderizarLocalidades();
}

function renderizarLocalidades() {
  limpiarHijos(dom.localidadesLista);

  if (!estado.ciudadesGuardadas.length) {
    const li = document.createElement('li');
    li.classList.add('localidades-lista__vacio');
    li.dataset.i18n = 'localidades_vacias';
    li.textContent = t('localidades_vacias');
    dom.localidadesLista.appendChild(li);
    return;
  }

  estado.ciudadesGuardadas.forEach((ciudad, idx) => {
    const li = document.createElement('li');
    li.classList.add('localidad-item');

    const icono = document.createElement('span');
    icono.classList.add('material-symbols-outlined', 'localidad-item__icono');
    icono.setAttribute('aria-hidden', 'true');
    icono.textContent = 'location_on';

    const nombre = document.createElement('span');
    nombre.classList.add('localidad-item__nombre');
    nombre.textContent = ciudad.ciudad;

    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('localidad-item__eliminar');
    btnEliminar.setAttribute('aria-label', 'Eliminar ' + ciudad.ciudad);
    const iconoEliminar = document.createElement('span');
    iconoEliminar.classList.add('material-symbols-outlined');
    iconoEliminar.setAttribute('aria-hidden', 'true');
    iconoEliminar.textContent = 'delete';
    btnEliminar.appendChild(iconoEliminar);
    btnEliminar.addEventListener('click', (e) => { e.stopPropagation(); eliminarCiudad(ciudad.ciudad); });

    li.addEventListener('click', () => { cargarClima(ciudad); cerrarSidebarMovil(); });
    li.appendChild(icono);
    li.appendChild(nombre);
    li.appendChild(btnEliminar);
    dom.localidadesLista.appendChild(li);
  });
}

async function guardarCiudad() {
  if (!estado.ultimaBusqueda) return;

  const { ciudad, region, lat, lon } = estado.ultimaBusqueda;
  const existe = estado.ciudadesGuardadas.find(c => c.ciudad === ciudad);

  if (existe) return;

  estado.ciudadesGuardadas.push({ ciudad, region, lat, lon });
  renderizarLocalidades();
  mostrarFeedbackCiudad(t('ciudad_guardada'), 'exito');

  try {
    await fetch('/api/user/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: ciudad, 
            latitude: lat, 
            longitude: lon 
        })
    });
  } catch (err) {
    console.error('Error al guardar ciudad en DB:', err);
  }
}

/** Elimina una ciudad de favoritos */
async function eliminarCiudad(nombre) {
  estado.ciudadesGuardadas = estado.ciudadesGuardadas.filter(c => c.ciudad !== nombre);
  renderizarLocalidades();

  try {
    await fetch(`/api/user/cities?name=${encodeURIComponent(nombre)}`, {
        method: 'DELETE'
    });
  } catch (err) {
    console.error('Error al eliminar ciudad de DB:', err);
  }
}

function mostrarFeedbackCiudad(msg, tipo) {
  dom.feedbackGuardar.textContent = msg;
  dom.feedbackGuardar.className = 'feedback-msg feedback-msg--' + tipo;
  mostrar(dom.feedbackGuardar);
  setTimeout(() => ocultar(dom.feedbackGuardar), 3000);
}

/* =====================================================
   SIDEBAR MÓVIL
   ===================================================== */
function abrirSidebarMovil() {
  dom.sidebar.classList.add('sidebar--abierto');
  dom.btnMenuMovil.setAttribute('aria-expanded', 'true');
  mostrar(dom.sidebarOverlay);
}

function cerrarSidebarMovil() {
  dom.sidebar.classList.remove('sidebar--abierto');
  dom.btnMenuMovil.setAttribute('aria-expanded', 'false');
  ocultar(dom.sidebarOverlay);
}

/* =====================================================
   SESIÓN
   ===================================================== */

/** Cierra la sesión de usuario y limpia el servidor */
async function cerrarSesion() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.replace('login.html');
  } catch (err) {
    window.location.replace('login.html');
  }
}

/** Verifica si hay sesión activa y sincroniza estado global con DB */
async function verificarSesion() {
  try {
    const res = await fetch('/api/user/sync');
    if (!res.ok) {
        window.location.replace('login.html');
        return;
    }
    const data = await res.json();
    
    // Sincronizar estado global
    estado.perfil = { 
        nombre: data.user.name, 
        avatar: data.user.avatar_url,
        email: data.user.email
    };
    estado.tema = data.preferences.theme;
    estado.idioma = data.preferences.language;
    
    // Mapear ciudades de la DB al formato de la App
    estado.ciudadesGuardadas = data.cities.map(c => ({
        ciudad: c.name,
        lat: parseFloat(c.latitude),
        lon: parseFloat(c.longitude)
    }));

    // Aplicar a UI inmediatamente
    aplicarTema();
    aplicarIdioma();
    cargarPerfil();
    renderizarLocalidades();
    
  } catch (err) {
    console.error('Error de sincronización:', err);
    window.location.replace('login.html');
  }
}

/* =====================================================
   INIT
   ===================================================== */

/** Inicialización de la App */
async function initApp() {
  cachearDOM();
  
  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registrado con éxito:', reg.scope);
    } catch (err) {
      console.error('Error al registrar SW:', err);
    }
  }

  // Sincronizar con el servidor antes de mostrar nada
  await verificarSesion();

  /* Iniciar mapa Leaflet */
  iniciarMapa();

  /* Listener Reintento Global */
  dom.btnReintentarGlobal.addEventListener('click', () => {
    if (estado.ultimaBusqueda) {
      cargarClima(estado.ultimaBusqueda);
    } else {
      window.location.reload();
    }
  });

  const ultimaBusqueda = lsGet(LS_ULTIMA);
  /* Restaurar última búsqueda */
  if (ultimaBusqueda) {
    estado.ultimaBusqueda = ultimaBusqueda;
    cargarClima(ultimaBusqueda);
  }

  /* ===== EVENTOS ===== */

  /* Toggle tema */
  dom.toggleTema.addEventListener('change', (e) => cambiarTema(e.target.checked));

  /* Botones idioma */
  dom.btnIdiomaEs.addEventListener('click', () => cambiarIdioma('es'));
  dom.btnIdiomaEn.addEventListener('click', () => cambiarIdioma('en'));

  /* Buscador */
  dom.formBuscador.addEventListener('submit', manejarSubmitBuscador);
  dom.buscadorInput.addEventListener('input', manejarInputBuscador);
  dom.buscadorInput.addEventListener('keydown', manejarKeydownBuscador);

  /* Cerrar sugerencias al clic fuera */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.buscador')) cerrarSugerencias();
  });

  /* Guardar ciudad */
  dom.btnGuardarCiudad.addEventListener('click', (e) => {
    e.preventDefault();
    guardarCiudad();
  });

  /* Logout */
  const btnLogout = document.getElementById('btn-cerrar-sesion');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
    });
  }

  /* Perfil */
  dom.btnEditarPerfil?.addEventListener('click', (e) => { e.preventDefault(); abrirModalPerfil(); });
  dom.btnCerrarModal.addEventListener('click', (e) => { e.preventDefault(); cerrarModalPerfil(); });
  dom.btnCancelarPerfil.addEventListener('click', (e) => { e.preventDefault(); cerrarModalPerfil(); });
  dom.formPerfil.addEventListener('submit', guardarPerfil);
  dom.inputAvatar.addEventListener('input', () => actualizarPreviewAvatar(dom.inputAvatar.value.trim()));
  dom.modalPerfil.addEventListener('click', (e) => { if (e.target === dom.modalPerfil) cerrarModalPerfil(); });

  /* Toggle ojo contraseña */
  dom.ojoPass?.addEventListener('click', () => {
    const isPass = dom.inputPass.type === 'password';
    dom.inputPass.type = isPass ? 'text' : 'password';
    const icono = dom.ojoPass.querySelector('.material-symbols-outlined');
    if (icono) icono.textContent = isPass ? 'visibility_off' : 'visibility';
  });

  /* Archivo local → base64 para avatar */
  dom.inputFile?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (dom.archivoNombre) dom.archivoNombre.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      dom.inputAvatar.value = ev.target.result;  // base64 data URL
      actualizarPreviewAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  });

  /* Cerrar sesión */
  dom.btnCerrarSesion.addEventListener('click', cerrarSesion);

  /* Nav sidebar — Toggle mapa expandido */
  const navMap = document.getElementById('nav-map');
  const navDash = document.getElementById('nav-dashboard');
  const navProfile = document.getElementById('nav-profile');
  const workspace = document.getElementById('segmented-workspace');

  if (navMap && workspace) {
    navMap.addEventListener('click', (e) => {
      e.preventDefault();
      const expandido = workspace.classList.toggle('mapa-expandido');

      // Actualizar estado activo del nav
      [navDash, navMap, navProfile].forEach(n => n?.classList.remove('sidebar__nav-item--activo'));
      if (expandido) {
        navMap.classList.add('sidebar__nav-item--activo');
        navMap.setAttribute('aria-current', 'page');
        navDash?.removeAttribute('aria-current');
      } else {
        navDash?.classList.add('sidebar__nav-item--activo');
        navDash?.setAttribute('aria-current', 'page');
        navMap.removeAttribute('aria-current');
      }

    });
  }

  /* Nav sidebar — Profile abre modal */
  if (navProfile) {
    navProfile.addEventListener('click', (e) => {
      e.preventDefault();
      abrirModalPerfil();
    });
  }

  /* Nav sidebar — Dashboard restaura vista */
  if (navDash) {
    navDash.addEventListener('click', (e) => {
      e.preventDefault();
      workspace?.classList.remove('mapa-expandido');
      [navDash, navMap, navProfile].forEach(n => n?.classList.remove('sidebar__nav-item--activo'));
      navDash.classList.add('sidebar__nav-item--activo');
      navDash.setAttribute('aria-current', 'page');
      navMap?.removeAttribute('aria-current');
    });
  }

  /* Sidebar móvil */
  dom.btnMenuMovil.addEventListener('click', (e) => {
    e.preventDefault();
    dom.sidebar.classList.contains('sidebar--abierto') ? cerrarSidebarMovil() : abrirSidebarMovil();
  });
  dom.sidebarOverlay.addEventListener('click', cerrarSidebarMovil);

  /* Escape global */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!dom.modalPerfil.hidden) cerrarModalPerfil();
      if (!dom.sugerenciasLista.hidden) cerrarSugerencias();
      cerrarSidebarMovil();
    }
  });

  /* Botones del mapa Leaflet */

  /* Botones del mapa Leaflet */
  document.getElementById('mapa-btn-capas')?.addEventListener('click', mapaToggleCapas);
  document.getElementById('mapa-btn-satelite')?.addEventListener('click', mapaToggleSatelite);
  document.getElementById('mapa-btn-centrar')?.addEventListener('click', mapaCentrar);

  /* Panel heatmap como trigger adicional para la capa térmica */
  document.querySelector('.mapa__heatmap')?.addEventListener('click', mapaToggleCapas);
}

/* =====================================================
   MÓDULO LEAFLET — MAPA INTERACTIVO
   ===================================================== */
const mapaState = {
  instancia: null,     // instancia L.map
  marcador: null,      // L.marker activo
  coordActual: null,   // { lat, lon, nombre }
  capaSat: false,      // ¿vista satélite?
  capaTermica: false,  // ¿capa de temperatura activa?
  tileStreet: null,
  tileSat: null,
  layerGroupTermico: null,  // L.layerGroup con los circles de temperatura
  tempActual: null,    // temperatura actual de la última búsqueda (°C)
};

/** Inicializa Leaflet en #leaflet-map */
function iniciarMapa() {
  if (!window.L) return;  // Leaflet no cargado
  if (mapaState.instancia) return; // ya inicializado

  const map = L.map('leaflet-map', {
    center: [20.0, 0.0],
    zoom: 3,
    minZoom: 3,               // evita zoom tan bajo que muestre bordes del mundo
    zoomControl: false,
    attributionControl: true,
    maxBounds: [[-85, -Infinity], [85, Infinity]],  // limita scroll vertical
    maxBoundsViscosity: 1.0,  // no permite arrastrar fuera de los bounds
  });

  /* Tile capa calles (dark mode) */
  mapaState.tileStreet = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 18, attribution: '© OpenStreetMap' }
  ).addTo(map);

  /* Tile capa satélite */
  mapaState.tileSat = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 18, attribution: '© ESRI' }
  );

  /* Layer group para la capa térmica */
  mapaState.layerGroupTermico = L.layerGroup();

  mapaState.instancia = map;

  // Implementar ResizeObserver para estabilizar el renderizado
  const observer = new ResizeObserver(() => {
    if (mapaState.instancia) {
      requestAnimationFrame(() => {
        mapaState.instancia.invalidateSize();
      });
    }
  });

  const contenedorMapa = document.getElementById('leaflet-map');
  if (contenedorMapa) {
    observer.observe(contenedorMapa);
  }
}

/** Navega el mapa a una ciudad */
function mapaNavegar(lat, lon, nombre) {
  const map = mapaState.instancia;
  if (!map) return;

  mapaState.coordActual = { lat, lon, nombre };

  // Recalcular tamaño por si el layout cambió
  map.invalidateSize();

  // Fly animado a la nueva ciudad
  map.flyTo([lat, lon], 11, { duration: 1.5, easeLinearity: 0.5 });

  // Quitar marcador anterior
  if (mapaState.marcador) {
    mapaState.marcador.remove();
    mapaState.marcador = null;
  }

  // Ícono personalizado SVG
  const svgIcon = L.divIcon({
    className: '',
    html: `<div style="
      width:2.8rem;height:2.8rem;
      background:var(--color-primario,#1dd0ed);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid rgba(2,6,23,.7);
      box-shadow:0 0 14px rgba(29,208,237,.7);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

  const marcador = L.marker([lat, lon], { icon: svgIcon }).addTo(map);
  marcador.bindPopup(
    `<strong style="font-size:1.3rem">${nombre}</strong><br>
     <span style="font-size:1.1rem;color:#64748b">${lat.toFixed(4)}, ${lon.toFixed(4)}</span>`,
    { className: 'mapa__popup', offset: [0, -10] }
  ).openPopup();

  mapaState.marcador = marcador;

  // Si la capa térmica está activa, actualizarla con la nueva ubicación
  if (mapaState.capaTermica && mapaState.tempActual !== null) {
    _dibujarCapaTermica();
  }
}

/** Alterna entre capa callejero / satélite */
function mapaToggleSatelite() {
  const map = mapaState.instancia;
  if (!map) return;

  mapaState.capaSat = !mapaState.capaSat;
  const btn = document.getElementById('mapa-btn-satelite');

  if (mapaState.capaSat) {
    map.removeLayer(mapaState.tileStreet);
    mapaState.tileSat.addTo(map);
    btn?.classList.add('activo');
  } else {
    map.removeLayer(mapaState.tileSat);
    mapaState.tileStreet.addTo(map);
    btn?.classList.remove('activo');
  }
}

/** Toggle capa de temperatura térmica */
function mapaToggleCapas() {
  const map = mapaState.instancia;
  if (!map) return;

  mapaState.capaTermica = !mapaState.capaTermica;

  const btnCapas = document.getElementById('mapa-btn-capas');
  const panelHeatmap = document.querySelector('.mapa__heatmap');

  if (mapaState.capaTermica) {
    btnCapas?.classList.add('activo');
    panelHeatmap?.classList.add('mapa__heatmap--activo');
    _dibujarCapaTermica();
  } else {
    btnCapas?.classList.remove('activo');
    panelHeatmap?.classList.remove('mapa__heatmap--activo');
    _limpiarCapaTermica();
  }
}

/** Guarda la temperatura actual para usar en la capa térmica */
function mapaSetTemperatura(temp) {
  mapaState.tempActual = temp;
  _actualizarEscalaHeatmap(temp);
}

/* ── Internos ── */

/** Limpia los circles de la capa térmica */
function _limpiarCapaTermica() {
  const map = mapaState.instancia;
  if (!map || !mapaState.layerGroupTermico) return;
  mapaState.layerGroupTermico.clearLayers();
  map.removeLayer(mapaState.layerGroupTermico);
}

/** Dibuja la capa térmica alrededor de la ciudad buscada */
function _dibujarCapaTermica() {
  const map = mapaState.instancia;
  if (!map || !mapaState.coordActual) return;

  _limpiarCapaTermica();

  const { lat, lon } = mapaState.coordActual;
  const temp = mapaState.tempActual ?? 20;

  // Crear anillos concéntricos de gradiente térmico
  const anillos = [
    { radio: 3000, opacidad: 0.35 },
    { radio: 6000, opacidad: 0.25 },
    { radio: 10000, opacidad: 0.18 },
    { radio: 16000, opacidad: 0.12 },
    { radio: 25000, opacidad: 0.07 },
  ];

  const colorBase = _tempAColor(temp);

  anillos.forEach(({ radio, opacidad }) => {
    const circle = L.circle([lat, lon], {
      radius: radio,
      color: 'transparent',
      fillColor: colorBase,
      fillOpacity: opacidad,
      interactive: false,
    });
    mapaState.layerGroupTermico.addLayer(circle);
  });

  // Añadir puntos de calor aleatorios cercanos para dar efecto de "heatmap" realista
  const variaciones = _generarPuntosTermicos(lat, lon, temp);
  variaciones.forEach(({ vlat, vlon, vtemp, vradio, vopacidad }) => {
    const circle = L.circle([vlat, vlon], {
      radius: vradio,
      color: 'transparent',
      fillColor: _tempAColor(vtemp),
      fillOpacity: vopacidad,
      interactive: false,
    });
    mapaState.layerGroupTermico.addLayer(circle);
  });

  mapaState.layerGroupTermico.addTo(map);
}

/** Genera puntos térmicos cercanos con variación de temperatura */
function _generarPuntosTermicos(lat, lon, tempBase) {
  const puntos = [];
  const offsets = [
    { dlat: 0.05, dlon: 0.08 }, { dlat: -0.06, dlon: 0.04 },
    { dlat: 0.03, dlon: -0.07 }, { dlat: -0.04, dlon: -0.05 },
    { dlat: 0.08, dlon: -0.02 }, { dlat: -0.02, dlon: 0.09 },
    { dlat: 0.04, dlon: 0.05 }, { dlat: -0.07, dlon: -0.03 },
    { dlat: 0.01, dlon: -0.09 }, { dlat: -0.09, dlon: 0.01 },
    { dlat: 0.06, dlon: 0.06 }, { dlat: -0.05, dlon: -0.08 },
  ];

  offsets.forEach(({ dlat, dlon }) => {
    const variacion = (Math.random() - 0.5) * 6; // ±3°C
    puntos.push({
      vlat: lat + dlat,
      vlon: lon + dlon,
      vtemp: tempBase + variacion,
      vradio: 3000 + Math.random() * 5000,
      vopacidad: 0.12 + Math.random() * 0.15,
    });
  });

  return puntos;
}

/** Convierte temperatura °C a color RGB para la capa térmica */
function _tempAColor(temp) {
  // Escala: -10°C=azul profundo → 0°C=cian → 15°C=verde → 25°C=amarillo → 35°C=rojo → 45°C+=magenta
  const t = Math.max(-10, Math.min(45, temp));
  let r, g, b;

  if (t <= 0) {
    // -10 → 0: azul → cian
    const p = (t + 10) / 10;
    r = 0;
    g = Math.round(p * 200);
    b = Math.round(200 + p * 55);
  } else if (t <= 15) {
    // 0 → 15: cian → verde
    const p = t / 15;
    r = 0;
    g = Math.round(200 + p * 55);
    b = Math.round(255 * (1 - p));
  } else if (t <= 25) {
    // 15 → 25: verde → amarillo
    const p = (t - 15) / 10;
    r = Math.round(p * 255);
    g = 255;
    b = 0;
  } else if (t <= 35) {
    // 25 → 35: amarillo → rojo
    const p = (t - 25) / 10;
    r = 255;
    g = Math.round(255 * (1 - p));
    b = 0;
  } else {
    // 35 → 45: rojo → magenta
    const p = (t - 35) / 10;
    r = 255;
    g = 0;
    b = Math.round(p * 180);
  }

  return `rgb(${r},${g},${b})`;
}

/** Actualiza las etiquetas de rango en el panel heatmap */
function _actualizarEscalaHeatmap(temp) {
  const escala = document.querySelector('.mapa__heatmap-escala');
  if (!escala) return;
  const spans = escala.querySelectorAll('span');
  if (spans.length >= 2) {
    const min = Math.round(temp - 5);
    const max = Math.round(temp + 5);
    spans[0].textContent = `${min}°C`;
    spans[1].textContent = `${max}°C`;
  }
}

/** Centra en la última ciudad buscada */
function mapaCentrar() {
  if (!mapaState.instancia || !mapaState.coordActual) return;
  const { lat, lon } = mapaState.coordActual;
  mapaState.instancia.flyTo([lat, lon], 11, { duration: 1 });
}

document.addEventListener('DOMContentLoaded', initApp);


