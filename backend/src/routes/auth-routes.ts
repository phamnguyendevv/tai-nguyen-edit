import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/google', AuthController.googleLogin);
router.get('/me', AuthController.getMe);
router.get('/test-accounts', AuthController.getTestAccounts);

export default router;
