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
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache) {
      if (now - entry.timestamp > 10 * 60 * 1000) {
        cache.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}
