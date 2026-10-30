import { Router } from 'express';
import { SoundEffectController } from '../controllers/sfx-controller.js';
import { requireAdmin } from '../middleware/auth-middleware.js';

const router = Router();

// Public routes (anyone can search, view, download)
router.get('/sound-effects', SoundEffectController.getSoundEffects);
router.get('/sound-effects/:id', SoundEffectController.getSoundEffectById);
router.post('/sound-effects/:id/download', SoundEffectController.incrementDownload);
router.get('/categories', SoundEffectController.getCategories);

// Protected routes (Admin role ONLY)
router.post('/sound-effects', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.createSoundEffect(req, res);
  });
});

router.delete('/sound-effects/:id', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.deleteSoundEffect(req, res);
  });
});

// Category & Subcategory Management routes (Admin role ONLY)
router.post('/categories', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.createCategory(req, res);
  });
});

router.put('/categories/:id', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.updateCategory(req, res);
  });
});

router.delete('/categories/:id', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.deleteCategory(req, res);
  });
});

router.post('/categories/:categoryId/subcategories', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.createSubcategory(req, res);
  });
});

router.put('/categories/:categoryId/subcategories/:subId', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.updateSubcategory(req, res);
  });
});

router.delete('/categories/:categoryId/subcategories/:subId', (req, res, next) => {
  requireAdmin(req, res, () => {
    SoundEffectController.deleteSubcategory(req, res);
  });
});

export default router;

