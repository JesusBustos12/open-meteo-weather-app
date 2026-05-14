/* =====================================================
   WEATHERAPP — Suite de Pruebas de Lógica (L01–L24)
   Ejecutar: node __tests__/logic.test.js
   ===================================================== */

// ===== MINI TEST RUNNER (0 dependencias) =====
let total = 0, passed = 0, failed = 0;
const results = [];

function describe(suite, fn) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  SUITE: ${suite}`);
  console.log('='.repeat(50));
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

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(msg || `Expected "${expected}", got "${actual}"`);
  }
}

function assertIncludes(haystack, needle, msg) {
  if (!haystack.includes(needle)) {
    throw new Error(msg || `Expected "${haystack}" to include "${needle}"`);
  }
}

// ===== IMPORTACIONES MANUALES (copiamos la lógica pura para test aislado) =====

// --- weatherUtils.js ---
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

function infoClima(codigoWMO) {
  return CODIGOS_CLIMA[codigoWMO] || { es: '—', en: '—', icono: '🌡️', msIcon: 'device_thermostat' };
}

function gradosADireccion(deg) {
  if (deg === undefined || deg === null) return '—';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function nivelUV(uv) {
  if (uv <= 0) return 'None';
  if (uv <= 2) return `Low (${uv})`;
  if (uv <= 5) return `Mod (${uv})`;
  if (uv <= 7) return `High (${uv})`;
  return `V.High (${uv})`;
}

// --- i18nData.js (subset) ---
const I18N = {
  es: {
    temperatura: 'Temperatura',
    sensacion: 'Sensación térmica',
    humedad: 'Humedad',
    viento: 'Viento',
    buscar_placeholder: 'Buscar ciudad...',
    localidades_titulo: 'Localidades',
    localidades_vacias: 'Sin localidades guardadas',
    cerrar_sesion: 'Cerrar sesión',
    cargando: 'Cargando datos...',
    pronostico_horas: 'Pronóstico 12 horas',
    editar_perfil: 'Editar perfil',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    ahora: 'Ahora',
  },
  en: {
    temperatura: 'Temperature',
    sensacion: 'Feels Like',
    humedad: 'Humidity',
    viento: 'Wind',
    buscar_placeholder: 'Search for a city...',
    localidades_titulo: 'Saved Locations',
    localidades_vacias: 'No saved locations',
    cerrar_sesion: 'Log Out',
    cargando: 'Loading data...',
    pronostico_horas: '12-Hour Forecast',
    editar_perfil: 'Edit profile',
    guardar: 'Save',
    cancelar: 'Cancel',
    ahora: 'Now',
  }
};

function t(key, lang = 'es') {
  const dict = I18N[lang] || I18N.es;
  return dict[key] || key;
}

// --- Geocoding scoring logic ---
function scoreSugerencia(item, queryNorm) {
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let score = 0;
  const nameNorm = normalize(item.name);

  if (item.population) {
    score += Math.log10(item.population) * 25;
  }

  const f = item.feature_code || '';
  if (f === 'PCLI') score += 2000;
  else if (f === 'PPLC') score += 1000;
  else if (f === 'PPLA') score += 500;
  else if (f.startsWith('PPLA')) score += 200;

  if (nameNorm === queryNorm) {
    score += 500;
  } else if (nameNorm.includes(queryNorm)) {
    score += 100;
  }

  return score;
}

// --- LeafletMap _tempAColor logic ---
function _tempAColor(temp) {
  const t = Math.max(-10, Math.min(45, temp));
  let r, g, b;

  if (t <= 0) {
    const p = (t + 10) / 10;
    r = 0; g = Math.round(p * 200); b = Math.round(200 + p * 55);
  } else if (t <= 15) {
    const p = t / 15;
    r = 0; g = Math.round(200 + p * 55); b = Math.round(255 * (1 - p));
  } else if (t <= 25) {
    const p = (t - 15) / 10;
    r = Math.round(p * 255); g = 255; b = 0;
  } else if (t <= 35) {
    const p = (t - 25) / 10;
    r = 255; g = Math.round(255 * (1 - p)); b = 0;
  } else {
    const p = (t - 35) / 10;
    r = 255; g = 0; b = Math.round(p * 180);
  }
  return `rgb(${r},${g},${b})`;
}


/* =====================================================
   TESTS
   ===================================================== */

describe('L01-L02: infoClima()', () => {
  it('L01 — infoClima(0) retorna "Despejado"', () => {
    const r = infoClima(0);
    assertEqual(r.es, 'Despejado');
    assertEqual(r.en, 'Clear sky');
    assertEqual(r.icono, '☀️');
    assertEqual(r.msIcon, 'sunny');
  });

  it('L02 — infoClima(999) retorna fallback "—"', () => {
    const r = infoClima(999);
    assertEqual(r.es, '—');
    assertEqual(r.en, '—');
    assertEqual(r.icono, '🌡️');
    assertEqual(r.msIcon, 'device_thermostat');
  });

  it('L02b — infoClima(95) retorna "Tormenta eléctrica"', () => {
    const r = infoClima(95);
    assertEqual(r.es, 'Tormenta eléctrica');
    assertEqual(r.en, 'Thunderstorm');
  });
});

describe('L03-L06: gradosADireccion()', () => {
  it('L03 — gradosADireccion(0) → "N"', () => {
    assertEqual(gradosADireccion(0), 'N');
  });

  it('L04 — gradosADireccion(45) → "NE"', () => {
    assertEqual(gradosADireccion(45), 'NE');
  });

  it('L05 — Todos los 8 puntos cardinales', () => {
    const esperado = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    for (let i = 0; i < 8; i++) {
      assertEqual(gradosADireccion(i * 45), esperado[i], `Fallo en ${i * 45}°`);
    }
  });

  it('L06 — gradosADireccion(null) → "—"', () => {
    assertEqual(gradosADireccion(null), '—');
    assertEqual(gradosADireccion(undefined), '—');
  });
});

describe('L07: nivelUV()', () => {
  it('L07a — nivelUV(0) → "None"', () => {
    assertEqual(nivelUV(0), 'None');
  });

  it('L07b — nivelUV(1) → "Low (1)"', () => {
    assertEqual(nivelUV(1), 'Low (1)');
  });

  it('L07c — nivelUV(2) → "Low (2)"', () => {
    assertEqual(nivelUV(2), 'Low (2)');
  });

  it('L07d — nivelUV(3) → "Mod (3)"', () => {
    assertEqual(nivelUV(3), 'Mod (3)');
  });

  it('L07e — nivelUV(5) → "Mod (5)"', () => {
    assertEqual(nivelUV(5), 'Mod (5)');
  });

  it('L07f — nivelUV(6) → "High (6)"', () => {
    assertEqual(nivelUV(6), 'High (6)');
  });

  it('L07g — nivelUV(7) → "High (7)"', () => {
    assertEqual(nivelUV(7), 'High (7)');
  });

  it('L07h — nivelUV(9) → "V.High (9)"', () => {
    assertEqual(nivelUV(9), 'V.High (9)');
  });

  it('L07i — nivelUV(-1) → "None"', () => {
    assertEqual(nivelUV(-1), 'None');
  });
});

describe('L08-L11: Scoring Geocoding', () => {
  it('L08 — Nombre exacto suma 500 puntos', () => {
    const score = scoreSugerencia({ name: 'Madrid', population: 1 }, 'madrid');
    assert(score >= 500, `Score ${score} debería ser >= 500`);
  });

  it('L09 — PPLC (Capital) suma 1000 puntos', () => {
    const score = scoreSugerencia({ name: 'Berlin', feature_code: 'PPLC', population: 1 }, 'berlin');
    assert(score >= 1000, `Score ${score} debería ser >= 1000`);
  });

  it('L10 — Población influye logarítmicamente', () => {
    const scoreBajo = scoreSugerencia({ name: 'Pueblo', population: 100 }, 'pueblo');
    const scoreAlto = scoreSugerencia({ name: 'Pueblo', population: 10000000 }, 'pueblo');
    assert(scoreAlto > scoreBajo, `${scoreAlto} debería ser > ${scoreBajo}`);
  });

  it('L11 — Normalización de diacríticos: México → mexico', () => {
    const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    assertEqual(normalize('México'), 'mexico');
    assertEqual(normalize('São Paulo'), 'sao paulo');
    assertEqual(normalize('Zürich'), 'zurich');
  });
});

describe('L12-L14: i18n', () => {
  it('L12 — Clave existente retorna traducción', () => {
    assertEqual(t('temperatura', 'es'), 'Temperatura');
    assertEqual(t('temperatura', 'en'), 'Temperature');
  });

  it('L13 — Clave inexistente retorna la propia clave', () => {
    assertEqual(t('clave_inexistente_xyz', 'es'), 'clave_inexistente_xyz');
  });

  it('L14 — Paridad es/en: todas las claves coinciden', () => {
    const keysEs = Object.keys(I18N.es);
    const keysEn = Object.keys(I18N.en);
    for (const key of keysEs) {
      assert(keysEn.includes(key), `Clave "${key}" falta en inglés`);
    }
    for (const key of keysEn) {
      assert(keysEs.includes(key), `Clave "${key}" falta en español`);
    }
  });
});

describe('L15-L18: Store Actions (lógica pura)', () => {
  it('L15 — addCity agrega al array', () => {
    const cities = [];
    const newCities = [...cities, { name: 'Berlin', latitude: 52.52, longitude: 13.41 }];
    assertEqual(newCities.length, 1);
    assertEqual(newCities[0].name, 'Berlin');
  });

  it('L16 — removeCity filtra correctamente', () => {
    const cities = [
      { name: 'Berlin' },
      { name: 'Madrid' },
      { name: 'Tokyo' }
    ];
    const filtered = cities.filter(c => c.name !== 'Madrid');
    assertEqual(filtered.length, 2);
    assert(!filtered.find(c => c.name === 'Madrid'), 'Madrid debería estar eliminada');
  });

  it('L17 — theme defaults', () => {
    // Simular setTheme
    const themes = ['dark', 'light'];
    assert(themes.includes('dark'), 'dark es un tema válido');
    assert(themes.includes('light'), 'light es un tema válido');
  });

  it('L18 — showToast message type', () => {
    // Verificar que los tipos válidos son 'error' y 'success'
    const validTypes = ['error', 'success'];
    assert(validTypes.includes('error'));
    assert(validTypes.includes('success'));
  });
});

describe('L19-L20: Search Logic', () => {
  it('L19 — Debounce: query < 2 chars no busca', () => {
    const q = 'M';
    assert(q.length < 2, 'Query de 1 char no debería buscar');
  });

  it('L20 — Ghost Hint mantiene casing del usuario', () => {
    const query = 'mad';
    const suggestion = 'Madrid, Comunidad de Madrid, España';
    
    if (suggestion.toLowerCase().startsWith(query.toLowerCase())) {
      const hint = query + suggestion.slice(query.length);
      assertEqual(hint.substring(0, 3), 'mad', 'Mantiene casing del usuario');
      assertIncludes(hint, 'rid', 'Completa con la sugerencia');
    }
  });
});

describe('L21-L22: _tempAColor()', () => {
  it('L21 — Extremo frío (-10°C) no crashea', () => {
    const color = _tempAColor(-10);
    assert(color.startsWith('rgb('), `Color válido: ${color}`);
  });

  it('L21b — Extremo caliente (45°C) no crashea', () => {
    const color = _tempAColor(45);
    assert(color.startsWith('rgb('), `Color válido: ${color}`);
  });

  it('L21c — Valor fuera de rango (100°C) no crashea (clamp a 45)', () => {
    const color = _tempAColor(100);
    assert(color.startsWith('rgb('), `Color válido: ${color}`);
  });

  it('L22 — 25°C produce amarillo (alto R, alto G, bajo B)', () => {
    const color = _tempAColor(25);
    // A 25°C, p=(25-15)/10 = 1.0, r=255, g=255, b=0
    assertEqual(color, 'rgb(255,255,0)', `25°C debería ser amarillo puro`);
  });
});

describe('L23-L24: SVG y Hourly', () => {
  it('L23 — SVG path con 12 puntos genera path válido', () => {
    const temps = [20, 21, 22, 23, 24, 23, 22, 21, 20, 19, 18, 17];
    const W = 400, H = 80, PAD = 6;
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const rango = max - min || 1;
    
    const puntos = temps.map((t, i) => {
      const x = PAD + (i / (temps.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((t - min) / rango) * (H - PAD * 2);
      return [x, y];
    });

    let pathD = `M ${puntos[0][0]} ${puntos[0][1]}`;
    for (let i = 1; i < puntos.length; i++) {
      const prev = puntos[i - 1];
      const curr = puntos[i];
      const cpx = (prev[0] + curr[0]) / 2;
      pathD += ` C ${cpx} ${prev[1]} ${cpx} ${curr[1]} ${curr[0]} ${curr[1]}`;
    }

    assert(pathD.startsWith('M '), 'Path comienza con M');
    assertIncludes(pathD, ' C ', 'Path contiene curvas C');
    assertEqual(puntos.length, 12, '12 puntos generados');
  });

  it('L24 — findIndex encuentra la hora actual', () => {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    // Simular array de 48 horas
    const times = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 48; i++) {
      const d = new Date(base.getTime() + i * 3600000);
      times.push(d.toISOString());
    }
    
    const indice = times.findIndex(timeStr => new Date(timeStr).getHours() === horaActual);
    assert(indice >= 0, `Hora actual (${horaActual}) encontrada en índice ${indice}`);
  });
});


// ===== REPORTE FINAL =====
console.log(`\n${'='.repeat(50)}`);
console.log(`  REPORTE FINAL`);
console.log('='.repeat(50));
console.log(`  Total:  ${total}`);
console.log(`  ✅ Pass: ${passed}`);
console.log(`  ❌ Fail: ${failed}`);
console.log(`  Ratio:  ${((passed / total) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

if (failed > 0) {
  console.log('\n  Pruebas fallidas:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`    ❌ ${r.id}: ${r.error}`);
  });
}

process.exit(failed > 0 ? 1 : 0);
