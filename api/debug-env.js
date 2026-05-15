export default async function handler(req, res) {
  // Endpoint temporal de diagnóstico — ELIMINAR después
  const envCheck = {
    DB_HOST: process.env.DB_HOST || 'NO DEFINIDA',
    DB_PORT: process.env.DB_PORT || 'NO DEFINIDA',
    DB_USER: process.env.DB_USER || 'NO DEFINIDA',
    DB_NAME: process.env.DB_NAME || 'NO DEFINIDA',
    DB_PASS_length: process.env.DB_PASS ? process.env.DB_PASS.length : 0,
    JWT_SECRET_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    NODE_ENV: process.env.NODE_ENV || 'NO DEFINIDA',
  };

  return res.status(200).json(envCheck);
}
