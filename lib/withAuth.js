import { NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function withAuth(handler) {
  return async function(req, ...args) {
    const userId = verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    req.userId = userId;
    return handler(req, ...args);
  };
}
