import { Router } from 'express';
import { UserController } from '../controllers/user-controller.js';
import { requireAdmin } from '../middleware/auth-middleware.js';

const router = Router();

// All user management routes require ADMIN privileges
router.get('/', requireAdmin, UserController.listUsers);
router.post('/', requireAdmin, UserController.createUser);
router.put('/:id', requireAdmin, UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);
router.patch('/:id/toggle-status', requireAdmin, UserController.toggleStatus);
router.patch('/:id/toggle-pro', requireAdmin, UserController.togglePro);

export default router;
