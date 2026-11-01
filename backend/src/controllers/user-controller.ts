import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user-repository.js';
import { AuthenticatedRequest } from '../middleware/auth-middleware.js';

export class UserController {
  /**
   * List all users (Admin only)
   */
  static async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await UserRepository.getAllUsers();
      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error in listUsers:', error);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
  }

  /**
   * Create a new user (Admin only)
   */
  static async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password, name, role, status, isPro } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: 'Email and Name are required' });
      }

      const user = await UserRepository.createUser({
        email,
        password: password || 'user123',
        name,
        role: role || 'USER',
        status: status || 'ACTIVE',
        isPro: !!isPro,
      });

      return res.status(201).json({
        user,
        message: `Đã tạo tài khoản "${user.name}" thành công`,
      });
    } catch (error: any) {
      console.error('Error in createUser:', error);
      return res.status(400).json({ error: error.message || 'Failed to create user' });
    }
  }

  /**
   * Update an existing user (Admin only)
   */
  static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, password, role, status, isPro } = req.body;

      const user = await UserRepository.updateUser(id, {
        name,
        email,
        password,
        role,
        status,
        isPro,
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        user,
        message: `Cập nhật thông tin tài khoản "${user.name}" thành công`,
      });
    } catch (error: any) {
      console.error('Error in updateUser:', error);
      return res.status(400).json({ error: error.message || 'Failed to update user' });
    }
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // Prevent deleting self if same id
      if (req.user?.id === id) {
        return res.status(400).json({ error: 'Bạn không thể tự xóa tài khoản của chính mình' });
      }

      const deleted = await UserRepository.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found or already deleted' });
      }

      return res.status(200).json({
        success: true,
        message: 'Tài khoản đã được xóa thành công',
      });
    } catch (error: any) {
      console.error('Error in deleteUser:', error);
      return res.status(400).json({ error: error.message || 'Failed to delete user' });
    }
  }

  /**
   * Toggle user status (ACTIVE <-> BANNED)
   */
  static async toggleStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      if (req.user?.id === id) {
        return res.status(400).json({ error: 'Không thể tự khóa tài khoản của chính mình' });
      }

      const user = await UserRepository.toggleStatus(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        user,
        message: `Đã ${user.status === 'BANNED' ? 'khóa' : 'kích hoạt lại'} tài khoản ${user.name}`,
      });
    } catch (error: any) {
      console.error('Error in toggleStatus:', error);
      return res.status(400).json({ error: error.message || 'Failed to toggle status' });
    }
  }

  /**
   * Toggle user Pro membership status
   */
  static async togglePro(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserRepository.togglePro(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        user,
        message: `Đã ${user.isPro ? 'kích hoạt gói Pro VIP' : 'hạ về tài khoản Miễn phí'} cho ${user.name}`,
      });
    } catch (error: any) {
      console.error('Error in togglePro:', error);
      return res.status(400).json({ error: error.message || 'Failed to toggle Pro' });
    }
  }
}
