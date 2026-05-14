export const CODIGOS_CLIMA = {
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

export function infoClima(codigoWMO) {
  return CODIGOS_CLIMA[codigoWMO] || { es: '—', en: '—', icono: '🌡️', msIcon: 'device_thermostat' };
}

export function gradosADireccion(deg) {
  if (deg === undefined || deg === null) return '—';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function nivelUV(uv) {
  if (uv <= 0) return 'None';
  if (uv <= 2) return `Low (${uv})`;
  if (uv <= 5) return `Mod (${uv})`;
  if (uv <= 7) return `High (${uv})`;
  return `V.High (${uv})`;
}
