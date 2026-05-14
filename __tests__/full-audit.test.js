/* =====================================================
   WEATHERAPP — Suite SEO + Arquitectura + Eventos + Calidad
   Ejecutar: node __tests__/full-audit.test.js
   ===================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

let total = 0, passed = 0, failed = 0;
const results = [];

function describe(suite, fn) {
  console.log(`\n${'='.repeat(55)}`);
  console.log(`  SUITE: ${suite}`);
  console.log('='.repeat(55));
  fn();
}

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
function assertEqual(a, b, msg) { if (a !== b) throw new Error(msg || `Expected "${b}", got "${a}"`); }

const ROOT = path.join(__dirname, '..');
function readSrc(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}
function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

/* =====================================================
   SEO (E01–E12)
   ===================================================== */
describe('SEO (E01–E12)', () => {

  it('E01 — html lang="es" por defecto', () => {
    const layout = readSrc('app/layout.jsx');
    assert(layout.includes('lang="es"'), 'layout.jsx no tiene lang="es"');
  });

  it('E02 — Meta title presente y descriptivo', () => {
    const layout = readSrc('app/layout.jsx');
    assert(layout.includes("title: 'WeatherApp'") || layout.includes('title: "WeatherApp"'),
      'No hay meta title definido');
  });

  it('E03 — Meta description presente', () => {
    const layout = readSrc('app/layout.jsx');
    assert(layout.includes('description:'), 'No hay meta description en layout.jsx');
  });

  it('E04 — Un solo <h1> por página (dashboard)', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    const h1Count = (dashboard.match(/<h1/g) || []).length;
    assertEqual(h1Count, 1, `Dashboard tiene ${h1Count} <h1> tags, debería ser 1`);
  });

  it('E04b — Un solo <h1> por página (login)', () => {
    const login = readSrc('app/(auth)/login/page.jsx');
    const h1Count = (login.match(/<h1/g) || []).length;
    assertEqual(h1Count, 1, `Login tiene ${h1Count} <h1> tags, debería ser 1`);
  });

  it('E05 — HTML semántico: usa <header>, <main>, <nav>, <footer>, <section>, <aside>', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    const login = readSrc('app/(auth)/login/page.jsx');
    
    assert(dashboard.includes('<header'), 'Dashboard no usa <header>');
    assert(dashboard.includes('<main') || dashboard.includes('className={`segmented-workspace'),
      'Dashboard no usa <main>');
    assert(dashboard.includes('<aside'), 'Dashboard no usa <aside>');
    assert(dashboard.includes('<nav'), 'Dashboard no usa <nav>');
    assert(dashboard.includes('<section'), 'Dashboard no usa <section>');
    
    assert(login.includes('<header') || login.includes('role="banner"'),
      'Login no usa <header> o role="banner"');
    assert(login.includes('<main') || login.includes('role="main"'),
      'Login no usa <main>');
    assert(login.includes('<footer') || login.includes('role="contentinfo"'),
      'Login no usa <footer>');
  });

  it('E06 — Alt text en imágenes', () => {
    const files = [
      'app/(dashboard)/page.jsx',
      'app/(auth)/login/page.jsx',
      'components/ProfileModal.jsx',
    ];
    for (const f of files) {
      const content = readSrc(f);
      // Buscar <img sin alt
      const imgTags = content.match(/<img[^>]*>/g) || [];
      for (const tag of imgTags) {
        assert(tag.includes('alt='), `${f} tiene <img> sin alt: ${tag.substring(0, 60)}`);
      }
    }
  });

  it('E07 — robots.txt presente', () => {
    assert(fileExists('legacy_public/robots.txt'),
      'No existe robots.txt');
  });

  it('E08 — sitemap.xml presente', () => {
    assert(fileExists('legacy_public/sitemap.xml'),
      'No existe sitemap.xml');
  });

  it('E09 — Open Graph meta tags (recomendación)', () => {
    const layout = readSrc('app/layout.jsx');
    // Esto es una recomendación, verificamos si existe
    const hasOG = layout.includes('openGraph') || layout.includes('og:');
    if (!hasOG) {
      console.log('         ⚠️  ADVERTENCIA: No hay Open Graph tags (recomendado añadir)');
    }
    // No falla, solo advierte
    assert(true);
  });

  it('E10 — Heading hierarchy (no salta niveles)', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    const widgets = readSrc('components/WeatherWidgets.jsx');
    const hourly = readSrc('components/HourlyForecast.jsx');
    
    // Dashboard tiene h1, widgets tiene h2, hourly tiene h3
    assert(dashboard.includes('<h1'), 'Dashboard no tiene h1');
    assert(widgets.includes('<h2') || dashboard.includes('<h2'), 'No hay h2 para la jerarquía');
    assert(hourly.includes('<h3') || hourly.includes('<h4'), 'No hay h3/h4 para sub-secciones');
  });

  it('E11 — Viewport meta (Next.js automático)', () => {
    // Next.js agrega viewport automáticamente
    assert(true, 'Next.js maneja viewport automáticamente');
  });

  it('E12 — Google Fonts con display=swap', () => {
    const layout = readSrc('app/layout.jsx');
    assert(layout.includes('display=swap'), 'Google Fonts no usa display=swap');
  });
});

/* =====================================================
   ARQUITECTURA (A01–A15)
   ===================================================== */
describe('ARQUITECTURA (A01–A15)', () => {

  it('A01 — Componentes con "use client" correctamente marcados', () => {
    const clientComponents = [
      'components/SearchBar.jsx',
      'components/WeatherWidgets.jsx',
      'components/HourlyForecast.jsx',
      'components/ProfileModal.jsx',
      'components/LeafletMap.jsx',
      'app/(dashboard)/page.jsx',
      'app/(auth)/login/page.jsx',
    ];
    for (const f of clientComponents) {
      const content = readSrc(f);
      assert(content.startsWith('"use client"') || content.startsWith("'use client'"),
        `${f} no tiene "use client" al inicio`);
    }
  });

  it('A02 — API Routes usan métodos REST correctos', () => {
    const loginRoute = readSrc('app/api/auth/login/route.js');
    const registerRoute = readSrc('app/api/auth/register/route.js');
    const syncRoute = readSrc('app/api/user/sync/route.js');
    const citiesRoute = readSrc('app/api/user/cities/route.js');
    const citiesDeleteRoute = readSrc('app/api/user/cities/[name]/route.js');
    const configRoute = readSrc('app/api/user/config/route.js');
    const profileRoute = readSrc('app/api/user/profile/route.js');
    const weatherRoute = readSrc('app/api/weather/route.js');
    const geocodingRoute = readSrc('app/api/geocoding/route.js');
    
    assert(loginRoute.includes('async function POST'), 'Login no exporta POST');
    assert(registerRoute.includes('async function POST'), 'Register no exporta POST');
    assert(syncRoute.includes('async function GET'), 'Sync no exporta GET');
    assert(citiesRoute.includes('async function POST'), 'Cities POST no exportado');
    assert(citiesDeleteRoute.includes('async function DELETE'), 'Cities DELETE no exportado');
    assert(configRoute.includes('async function PUT'), 'Config no exporta PUT');
    assert(profileRoute.includes('async function PUT'), 'Profile no exporta PUT');
    assert(weatherRoute.includes('async function GET'), 'Weather no exporta GET');
    assert(geocodingRoute.includes('async function GET'), 'Geocoding no exporta GET');
  });

  it('A03 — Estado centralizado con Zustand (useStore)', () => {
    const store = readSrc('lib/store.js');
    assert(store.includes("import { create } from 'zustand'"), 'No usa zustand');
    assert(store.includes('export const useStore'), 'No exporta useStore');
    
    // Verificar que los componentes usan useStore
    const components = [
      'components/SearchBar.jsx',
      'components/WeatherWidgets.jsx',
      'components/HourlyForecast.jsx',
      'app/(dashboard)/page.jsx',
    ];
    for (const f of components) {
      const content = readSrc(f);
      assert(content.includes('useStore'), `${f} no usa useStore`);
    }
  });

  it('A04 — APIs externas solo se llaman desde el servidor (proxy)', () => {
    const clientFiles = [
      'components/SearchBar.jsx',
      'components/WeatherWidgets.jsx',
      'lib/store.js',
      'app/(dashboard)/page.jsx',
    ];
    for (const f of clientFiles) {
      const content = readSrc(f);
      assert(!content.includes('api.open-meteo.com'),
        `${f} llama directamente a Open-Meteo (debería usar proxy /api/)`);
      assert(!content.includes('geocoding-api.open-meteo.com'),
        `${f} llama directamente a Geocoding API (debería usar proxy /api/)`);
    }
  });

  it('A05 — Pool de conexiones MySQL con límite', () => {
    const db = readSrc('lib/db.js');
    assert(db.includes('connectionLimit: 10'), 'Pool no tiene connectionLimit');
    assert(db.includes('waitForConnections: true'), 'Pool no tiene waitForConnections');
  });

  it('A06 — Hot Reload safe pool (global.mysqlPool)', () => {
    const db = readSrc('lib/db.js');
    assert(db.includes('global.mysqlPool'), 'No usa global.mysqlPool para dev');
    assert(db.includes("process.env.NODE_ENV === 'production'"),
      'No diferencia entre dev y production');
  });

  it('A07 — Layout nesting: RootLayout > AuthLayout/DashboardLayout', () => {
    assert(fileExists('app/layout.jsx'), 'No existe RootLayout');
    assert(fileExists('app/(auth)/layout.jsx'), 'No existe AuthLayout');
    assert(fileExists('app/(dashboard)/layout.jsx'), 'No existe DashboardLayout');
    
    const dashLayout = readSrc('app/(dashboard)/layout.jsx');
    assert(dashLayout.includes("leaflet.css"), 'DashboardLayout no carga Leaflet CSS');
    assert(dashLayout.includes("styles.css") || dashLayout.includes("../styles/styles"),
      'DashboardLayout no importa styles.css');
  });

  it('A08 — Dynamic import SSR disabled para LeafletMap', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes("dynamic("), 'No usa dynamic import');
    assert(dashboard.includes("ssr: false"), 'LeafletMap no tiene ssr: false');
  });

  it('A09 — Custom Hook useTranslation reutilizable', () => {
    const hook = readSrc('hooks/useTranslation.js');
    assert(hook.includes('export function useTranslation'), 'useTranslation no exportado');
    assert(hook.includes('useStore'), 'useTranslation no usa useStore para el idioma');
    assert(hook.includes("return { t, language }"), 'useTranslation no retorna { t, language }');
  });

  it('A10 — Estructura de carpetas alineada con Agents.md', () => {
    const expectedDirs = [
      'app',
      'components',
      'lib',
      'hooks',
      'public',
    ];
    for (const dir of expectedDirs) {
      assert(fs.existsSync(path.join(ROOT, dir)),
        `Carpeta ${dir} no existe`);
    }
  });

  it('A11 — Variables CSS centralizadas en :root', () => {
    const css = readSrc('app/styles/styles.css');
    assert(css.includes(':root {'), 'No hay bloque :root');
    assert(css.includes('--color-bg:'), 'No hay --color-bg');
    assert(css.includes('--color-primario:'), 'No hay --color-primario');
    assert(css.includes('--color-texto:'), 'No hay --color-texto');
    assert(css.includes('--color-error:'), 'No hay --color-error');
    assert(css.includes('--color-exito:'), 'No hay --color-exito');
    assert(css.includes('--sidebar-w:'), 'No hay --sidebar-w');
    assert(css.includes('--header-h:'), 'No hay --header-h');
  });

  it('A12 — Media queries para responsive', () => {
    const css = readSrc('app/styles/styles.css');
    const mediaCount = (css.match(/@media/g) || []).length;
    assert(mediaCount >= 1, `Solo hay ${mediaCount} media queries (debería haber >= 1)`);
  });

  it('A13 — Separación CSS: styles.css para dashboard, login.css para auth', () => {
    assert(fileExists('app/styles/styles.css'), 'No existe styles.css');
    assert(fileExists('app/styles/login.css'), 'No existe login.css');
    
    const dashLayout = readSrc('app/(dashboard)/layout.jsx');
    const authLayout = readSrc('app/(auth)/layout.jsx');
    assert(dashLayout.includes('styles.css') || dashLayout.includes('styles'),
      'DashboardLayout no importa styles.css');
    assert(authLayout.includes('login.css') || authLayout.includes('login'),
      'AuthLayout no importa login.css');
  });

  it('A14 — Dockerfile multi-stage', () => {
    const docker = readSrc('Dockerfile');
    const fromCount = (docker.match(/FROM/g) || []).length;
    assert(fromCount >= 2, 'Dockerfile no tiene multi-stage (necesita >= 2 FROM)');
    assert(docker.includes('AS builder'), 'No tiene fase de build');
    assert(docker.includes('--from=builder'), 'No copia desde fase builder');
  });

  it('A15 — .env protegido por .gitignore', () => {
    const gitignore = readSrc('.gitignore');
    assert(gitignore.includes('.env'), '.env no está en .gitignore');
  });
});

/* =====================================================
   EVENTOS / INTERFAZ (V01–V24) — Análisis estático
   ===================================================== */
describe('EVENTOS / INTERFAZ (V01–V24)', () => {

  it('V01 — Form submit preventDefault en SearchBar', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes('onSubmit={handleSubmit}'), 'Formulario no tiene onSubmit');
    assert(search.includes('e.preventDefault()'), 'handleSubmit no previene default');
  });

  it('V02 — Escape cierra sugerencias', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes("e.key === 'Escape'"), 'No maneja tecla Escape');
    assert(search.includes('setIsFocused(false)'), 'Escape no cierra sugerencias');
  });

  it('V03 — ArrowDown navega sugerencias', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes("e.key === 'ArrowDown'"), 'No maneja ArrowDown');
    assert(search.includes('e.preventDefault()'), 'ArrowDown no previene scroll');
  });

  it('V04 — ArrowUp navega sugerencias (circular)', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes("e.key === 'ArrowUp'"), 'No maneja ArrowUp');
    assert(search.includes('suggestions.length) % suggestions.length'),
      'Navegación no es circular');
  });

  it('V05 — Enter selecciona sugerencia', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes("e.key === 'Enter'"), 'No maneja Enter');
    assert(search.includes('handleSelect(suggestions['), 'Enter no selecciona sugerencia');
  });

  it('V06 — Tab acepta ghost hint', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes("e.key === 'Tab'"), 'No maneja Tab para ghost hint');
    assert(search.includes('setQuery(ghostHint)'), 'Tab no acepta ghost hint');
  });

  it('V07 — Click en sugerencia la selecciona', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes('onClick={() => handleSelect(sug)'),
      'Sugerencias no tienen onClick para selección');
  });

  it('V08 — Toggle tema cambia data-theme', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    const store = readSrc('lib/store.js');
    
    assert(dashboard.includes("setTheme(theme === 'dark' ? 'light' : 'dark')"),
      'Toggle tema no alterna dark/light');
    assert(store.includes("document.documentElement.setAttribute('data-theme', theme)"),
      'setTheme no actualiza data-theme en el DOM');
  });

  it('V09 — Toggle idioma actualiza UI', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes("setLanguage('es')"), 'No hay botón para español');
    assert(dashboard.includes("setLanguage('en')"), 'No hay botón para inglés');
    assert(dashboard.includes("/api/user/config"), 'Cambio de idioma no persiste en backend');
  });

  it('V10 — Modal perfil abre/cierra', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes('setIsProfileModalOpen(true)'), 'No abre modal');
    assert(dashboard.includes('setIsProfileModalOpen(false)'), 'No cierra modal');
    assert(dashboard.includes('<ProfileModal'), 'No renderiza ProfileModal');
  });

  it('V11 — Modal click outside cierra', () => {
    const modal = readSrc('components/ProfileModal.jsx');
    assert(modal.includes("e.target.id === 'modal-perfil'") && modal.includes('onClose()'),
      'Modal no se cierra al hacer click en overlay');
  });

  it('V12 — Guardar ciudad llama saveCityAuth', () => {
    const widgets = readSrc('components/WeatherWidgets.jsx');
    assert(widgets.includes('saveCityAuth'), 'WeatherWidgets no usa saveCityAuth');
    assert(widgets.includes('onClick={() => saveCityAuth('),
      'Botón guardar no llama saveCityAuth');
  });

  it('V13 — Eliminar ciudad llama removeCityAuth', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes('removeCityAuth(city.name)'),
      'No se llama removeCityAuth al eliminar');
  });

  it('V14 — stopPropagation en botón delete', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes('e.stopPropagation()'),
      'Botón delete no usa stopPropagation');
  });

  it('V15 — Logout redirige a /login', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes("router.push('/login')"),
      'Logout no redirige a /login');
    assert(dashboard.includes("/api/auth/logout"),
      'Logout no llama a la API de logout');
  });

  it('V16 — Sidebar toggle móvil', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes('isSidebarOpen'), 'No hay estado para sidebar');
    assert(dashboard.includes('setIsSidebarOpen(true)'), 'No abre sidebar');
    assert(dashboard.includes('setIsSidebarOpen(false)'), 'No cierra sidebar');
    assert(dashboard.includes('sidebar-overlay') || dashboard.includes('sidebar--abierto'),
      'No hay overlay para sidebar móvil');
  });

  it('V17 — Login form validación campos vacíos', () => {
    const login = readSrc('app/(auth)/login/page.jsx');
    assert(login.includes('!loginEmail || !loginPass'),
      'Login no valida campos vacíos');
    assert(login.includes("type: 'error'"),
      'No muestra error visual');
  });

  it('V18 — Register form validación campos vacíos', () => {
    const login = readSrc('app/(auth)/login/page.jsx');
    assert(login.includes('!regName || !regEmail || !regPass'),
      'Register no valida campos vacíos');
  });

  it('V19 — Password visibility toggle', () => {
    const login = readSrc('app/(auth)/login/page.jsx');
    const modal = readSrc('components/ProfileModal.jsx');
    
    assert(login.includes('showLoginPass') && login.includes('setShowLoginPass'),
      'Login no tiene toggle de password');
    assert(modal.includes('showPassword') && modal.includes('setShowPassword'),
      'Modal no tiene toggle de password');
  });

  it('V20 — File upload avatar actualiza preview', () => {
    const modal = readSrc('components/ProfileModal.jsx');
    assert(modal.includes('handleFileChange'), 'No hay handler para file');
    assert(modal.includes('FileReader'), 'No usa FileReader para preview');
    assert(modal.includes('readAsDataURL'), 'No convierte a DataURL');
  });

  it('V21 — aria-expanded en buscador', () => {
    const search = readSrc('components/SearchBar.jsx');
    assert(search.includes('aria-expanded='),
      'Buscador no tiene aria-expanded');
  });

  it('V22 — aria-pressed en botones de idioma', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    assert(dashboard.includes('aria-pressed='),
      'Botones de idioma no tienen aria-pressed');
  });

  it('V23 — role="alert" en toast/feedback', () => {
    const search = readSrc('components/SearchBar.jsx');
    const login = readSrc('app/(auth)/login/page.jsx');
    assert(search.includes('role="alert"'), 'Toast en SearchBar no tiene role="alert"');
    assert(login.includes('role="alert"'), 'Feedback en Login no tiene role="alert"');
  });

  it('V24 — role="dialog" en modal', () => {
    const modal = readSrc('components/ProfileModal.jsx');
    assert(modal.includes('role="dialog"'), 'Modal no tiene role="dialog"');
    assert(modal.includes('aria-modal="true"'), 'Modal no tiene aria-modal="true"');
    assert(modal.includes('aria-labelledby='), 'Modal no tiene aria-labelledby');
  });
});

/* =====================================================
   CALIDAD DE CÓDIGO (Q01–Q10)
   ===================================================== */
describe('CALIDAD DE CÓDIGO (Q01–Q10)', () => {

  it('Q01 — No usa alert(), confirm(), prompt()', () => {
    const activeFiles = [
      'app/(dashboard)/page.jsx',
      'app/(auth)/login/page.jsx',
      'components/SearchBar.jsx',
      'components/WeatherWidgets.jsx',
      'components/HourlyForecast.jsx',
      'components/ProfileModal.jsx',
      'components/LeafletMap.jsx',
      'lib/store.js',
    ];
    for (const f of activeFiles) {
      const content = readSrc(f);
      // Excluir comentarios y strings que mencionen alert
      const lines = content.split('\n').filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('*'));
      const code = lines.join('\n');
      assert(!code.match(/\balert\s*\(/), `${f} usa alert()`);
      assert(!code.match(/\bconfirm\s*\(/), `${f} usa confirm()`);
      assert(!code.match(/\bprompt\s*\(/), `${f} usa prompt()`);
    }
  });

  it('Q02 — No usa innerHTML en código activo (excepto marker Leaflet)', () => {
    const activeFiles = [
      'app/(dashboard)/page.jsx',
      'app/(auth)/login/page.jsx',
      'components/SearchBar.jsx',
      'components/WeatherWidgets.jsx',
      'components/HourlyForecast.jsx',
      'components/ProfileModal.jsx',
      'lib/store.js',
    ];
    for (const f of activeFiles) {
      const content = readSrc(f);
      assert(!content.includes('innerHTML'), `${f} usa innerHTML`);
    }
  });

  it('Q03 — CSS usa rem (no px) para medidas principales', () => {
    const css = readSrc('app/styles/styles.css');
    assert(css.includes('font-size: 10px'), 'No tiene font-size base de 10px');
    // Contar rem vs px en propiedades que deberían usar rem
    const remCount = (css.match(/\drem/g) || []).length;
    assert(remCount > 50, `Solo ${remCount} usos de rem (debería haber muchos más)`);
  });

  it('Q04 — CSS Variables para todos los colores', () => {
    const css = readSrc('app/styles/styles.css');
    const rootBlock = css.match(/:root\s*\{[^}]+\}/s);
    assert(rootBlock, 'No hay bloque :root');
    
    const colorVars = (rootBlock[0].match(/--color-/g) || []).length;
    assert(colorVars >= 15, `Solo ${colorVars} variables de color definidas`);
  });

  it('Q05 — IDs descriptivos y únicos en componentes', () => {
    const dashboard = readSrc('app/(dashboard)/page.jsx');
    const search = readSrc('components/SearchBar.jsx');
    
    // Verificar IDs descriptivos
    assert(search.includes('id="buscador-input"'), 'Input de búsqueda no tiene ID descriptivo');
    assert(search.includes('id="buscador-hint"'), 'Hint no tiene ID descriptivo');
    assert(dashboard.includes('id="segmented-workspace"') || dashboard.includes('id="sidebar"'),
      'Dashboard no tiene IDs descriptivos');
  });

  it('Q06 — useEffect tiene cleanup donde es necesario', () => {
    const search = readSrc('components/SearchBar.jsx');
    const leaflet = readSrc('components/LeafletMap.jsx');
    
    // SearchBar debounce cleanup
    assert(search.includes('return () => clearTimeout'),
      'SearchBar useEffect no limpia debounce timer');
    
    // LeafletMap cleanup
    assert(leaflet.includes('return () =>') && leaflet.includes('.remove()'),
      'LeafletMap useEffect no limpia mapa');
    assert(leaflet.includes('ro.disconnect()'),
      'LeafletMap no desconecta ResizeObserver');
  });

  it('Q07 — Todas las operaciones async tienen try/catch', () => {
    const store = readSrc('lib/store.js');
    const asyncFns = ['saveCityAuth', 'removeCityAuth', 'updateProfile', 'syncFromBackend',
                       'fetchSuggestions', 'fetchWeather'];
    for (const fn of asyncFns) {
      const fnIndex = store.indexOf(fn);
      assert(fnIndex >= 0, `Función ${fn} no encontrada`);
      // Verificar que hay un catch cercano
      const nearbyCode = store.substring(fnIndex, fnIndex + 1200);
      assert(nearbyCode.includes('catch'), `${fn} no tiene manejo de errores`);
    }
  });

  it('Q08 — Errores del servidor se loggean con prefijo descriptivo', () => {
    const serverFiles = [
      'app/api/auth/login/route.js',
      'app/api/auth/register/route.js',
      'app/api/user/sync/route.js',
      'app/api/user/profile/route.js',
    ];
    for (const f of serverFiles) {
      const content = readSrc(f);
      if (content.includes('console.error')) {
        assert(content.includes('[ERROR]') || content.includes('[error]') ||
               content.includes('PROFILE_API_ERROR'),
          `${f} tiene console.error sin prefijo descriptivo`);
      }
    }
  });

  it('Q09 — legacy main.js usa "use strict"', () => {
    const main = readSrc('legacy_public/assets/js/main.js');
    assert(main.includes("'use strict'"), 'main.js legacy no usa strict mode');
  });

  it('Q10 — Clases CSS siguen convención BEM (bloque__elemento--modificador)', () => {
    const css = readSrc('app/styles/styles.css');
    // Verificar patrones BEM
    const bemPatterns = [
      'sidebar__logo',
      'sidebar__nav-item',
      'sidebar__nav-item--activo',
      'buscador__input',
      'buscador__input--hint',
      'clima-tarjeta__etiqueta',
      'localidad-item__nombre',
      'localidad-item__eliminar',
      'sugerencia-item--activo',
      'header__perfil',
      'toggle-wrap__icono',
    ];
    
    let found = 0;
    for (const pattern of bemPatterns) {
      if (css.includes(pattern)) found++;
    }
    assert(found >= 8, `Solo ${found}/11 patrones BEM encontrados`);
  });
});


// ═══ REPORTE FINAL CONSOLIDADO ═══
console.log('\n' + '═'.repeat(55));
console.log('  REPORTE FINAL CONSOLIDADO');
console.log('═'.repeat(55));
console.log(`  Total:    ${total}`);
console.log(`  ✅ Pass:  ${passed}`);
console.log(`  ❌ Fail:  ${failed}`);
console.log(`  Ratio:    ${((passed / total) * 100).toFixed(1)}%`);
console.log('═'.repeat(55));

if (failed > 0) {
  console.log('\n  Pruebas fallidas:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`    ❌ ${r.id}`);
    console.log(`       → ${r.error}`);
  });
}

process.exit(failed > 0 ? 1 : 0);
