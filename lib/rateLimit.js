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
if (typeof setInterval !== 'undefined') {
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
}
