import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user-repository.js';
import { SafeUser } from '../types/auth.js';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export async function parseAuthToken(token: string): Promise<SafeUser | null> {
  if (!token) return null;
  const clean = token.replace(/^Bearer\s+/i, '').trim();

  // Handle format: sfx-auth-<userId> or direct email or id
  let userId = clean;
  if (clean.startsWith('sfx-auth-')) {
    userId = clean.replace('sfx-auth-', '');
  }

  // Find user by id or email
  let user = await UserRepository.findById(userId);
  if (!user) {
    user = await UserRepository.findByEmail(userId);
  }

  return user ? UserRepository.toSafeUser(user) : null;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Missing Authorization header.' });
  }

  const user = await parseAuthToken(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }

  req.user = user;
  next();
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Missing Authorization header.' });
  }

  const user = await parseAuthToken(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Access Denied: Administrator role required to perform this action.',
      role: user.role,
    });
  }

  req.user = user;
  next();
}
