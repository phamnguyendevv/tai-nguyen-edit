import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user-repository.js';
import { AuthenticatedRequest, parseAuthToken } from '../middleware/auth-middleware.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide both email and password' });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const safeUser = UserRepository.toSafeUser(user);
      const token = `sfx-auth-${user.id}`;

      return res.status(200).json({
        token,
        user: safeUser,
        message: `Logged in successfully as ${safeUser.name} (${safeUser.role})`,
      });
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({ error: 'Internal Server Error during login' });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await parseAuthToken(authHeader);
      if (!user) {
        return res.status(401).json({ error: 'Session expired or invalid' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Failed to verify session' });
    }
  }

  static async googleLogin(req: Request, res: Response) {
    try {
      const { email, name, avatarUrl, googleId } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required for Google Sign-In' });
      }

      const user = await UserRepository.createOrUpdateGoogleUser({
        email,
        name: name || email.split('@')[0],
        avatarUrl,
        googleId,
      });

      const safeUser = UserRepository.toSafeUser(user);
      const token = `sfx-auth-${user.id}`;

      return res.status(200).json({
        token,
        user: safeUser,
        message: `Đăng nhập Google thành công với tài khoản ${safeUser.email}`,
      });
    } catch (error) {
      console.error('Error in googleLogin:', error);
      return res.status(500).json({ error: 'Internal Server Error during Google login' });
    }
  }

  static async getTestAccounts(req: Request, res: Response) {
    try {
      return res.status(200).json({
        accounts: [
          {
            email: 'admin@magnific.com',
            password: 'admin123',
            name: 'Master Sound Director',
            role: 'ADMIN',
            description: 'Full administrative access to Upload Studio, Waveform Analysis & Sound Deletion',
          },
          {
            email: 'user@magnific.com',
            password: 'user123',
            name: 'Alex Sound Creator',
            role: 'USER',
            description: 'Standard creator account: listen, bookmark favorites, download audio (no admin rights)',
          },
        ],
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve test accounts' });
    }
  }
}
