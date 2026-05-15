export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Borrar cookie del token
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
  return res.status(200).json({ success: true });
}
