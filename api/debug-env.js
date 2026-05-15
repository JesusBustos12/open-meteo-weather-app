export default async function handler(req, res) {
  // Endpoint temporal de diagnóstico - ELIMINAR después de confirmar
  const envCheck = {
    DB_HOST_exists: !!process.env.DB_HOST,
    DB_HOST_value: process.env.DB_HOST ? process.env.DB_HOST.substring(0, 15) + '...' : 'UNDEFINED',
    DB_PORT_exists: !!process.env.DB_PORT,
    DB_USER_exists: !!process.env.DB_USER,
    DB_PASS_exists: !!process.env.DB_PASS,
    DB_NAME_exists: !!process.env.DB_NAME,
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'UNDEFINED',
    allEnvKeys: Object.keys(process.env).filter(k => k.startsWith('DB_') || k.startsWith('JWT_') || k.startsWith('COOKIE_')),
  };

  return res.status(200).json(envCheck);
}
