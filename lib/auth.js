import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  try {
    const tokenCookie = req.cookies.get('token');
    if (!tokenCookie) {
      return null;
    }

    const token = tokenCookie.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return decoded.userId;
  } catch (error) {
    return null; // Token inválido o ha expirado
  }
}
