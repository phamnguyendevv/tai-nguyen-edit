import { Request, Response } from 'express';
import { SoundEffectRepository } from '../repositories/sfx-repository.js';
import { SortOption } from '../types/sfx.js';

export class SoundEffectController {
  static async getSoundEffects(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const category = (req.query.category as string) || 'all';
      const subcategory = (req.query.subcategory as string) || '';
      const sort = (req.query.sort as SortOption) || 'most-popular';
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '12', 10);

      const result = await SoundEffectRepository.query({
        q,
        category,
        subcategory,
        sort,
        page,
        limit,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getSoundEffects:', error);
      return res.status(500).json({ error: 'Failed to retrieve sound effects' });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await SoundEffectRepository.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error in getCategories:', error);
      return res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  }

  static async getSoundEffectById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const sfx = await SoundEffectRepository.getById(id);
      if (!sfx) {
        return res.status(404).json({ error: 'Sound effect not found' });
      }
      return res.status(200).json(sfx);
    } catch (error) {
      console.error('Error in getSoundEffectById:', error);
      return res.status(500).json({ error: 'Failed to retrieve sound effect' });
    }
  }

  static async incrementDownload(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const updated = await SoundEffectRepository.incrementDownload(id);
      if (!updated) {
        return res.status(404).json({ error: 'Sound effect not found' });
      }

      // If client requests the binary attachment directly
      if (req.query.file === 'true' || req.headers.accept?.includes('audio/')) {
        const fs = await import('fs');
        const path = await import('path');
        const cleanPath = updated.audioUrl.startsWith('/') ? updated.audioUrl.slice(1) : updated.audioUrl;
        const filePath = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'audio/wav');
          res.setHeader('Content-Disposition', `attachment; filename="${updated.slug}.wav"`);
          return fs.createReadStream(filePath).pipe(res);
        }
      }

      return res.status(200).json({
        success: true,
        downloadsCount: updated.downloadsCount,
        downloadUrl: updated.audioUrl,
        title: updated.title,
      });
    } catch (error) {
      console.error('Error in incrementDownload:', error);
      return res.status(500).json({ error: 'Failed to record download' });
    }
  }

  static async createSoundEffect(req: Request, res: Response) {
    try {
      const { title, category, subcategory, duration, waveform, tags, audioUrl, audioBase64, format, license } = req.body;

      if (!title || !duration || !waveform) {
        return res.status(400).json({ error: 'Missing required fields: title, duration, waveform' });
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = `sfx-${slug}-${Date.now().toString().slice(-4)}`;

      let finalAudioUrl = audioUrl || `/audio/sfx/${slug}.wav`;

      // If base64 provided, write to disk
      if (audioBase64) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const ext = format?.toLowerCase().includes('mp3') ? 'mp3' : 'wav';
          const filename = `${slug}.${ext}`;
          
          const saveDir = path.resolve(process.cwd(), 'public', 'audio', 'sfx');
          if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
          }
          const savePath = path.join(saveDir, filename);
          const buf = Buffer.from(audioBase64.split(',')[1] || audioBase64, 'base64');
          fs.writeFileSync(savePath, buf);
          finalAudioUrl = `/audio/sfx/${filename}`;
        } catch (e) {
          console.warn('Could not save uploaded audio to disk, using audioUrl', e);
        }
      }

      const newSfx = {
        id,
        title,
        slug,
        category: category || 'realistic',
        subcategory: subcategory || 'wildlife',
        audioUrl: finalAudioUrl,
        duration: Number(duration),
        waveform: Array.isArray(waveform) ? waveform : [],
        tags: Array.isArray(tags) ? tags : ['custom', 'uploaded'],
        downloadsCount: 0,
        popularity: 90,
        createdAt: new Date().toISOString(),
        fileSizeBytes: 250000,
        format: format || 'Audio WAV/MP3',
        license: license || 'Royalty-Free / CC0',
      };

      await SoundEffectRepository.create(newSfx);
      return res.status(201).json(newSfx);
    } catch (error) {
      console.error('Error in createSoundEffect:', error);
      return res.status(500).json({ error: 'Failed to create sound effect' });
    }
  }

  static async deleteSoundEffect(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const success = await SoundEffectRepository.delete(id);
      if (!success) {
        return res.status(404).json({ error: 'Sound effect not found' });
      }
      return res.status(200).json({ success: true, message: `Deleted ${id}` });
    } catch (error) {
      console.error('Error in deleteSoundEffect:', error);
      return res.status(500).json({ error: 'Failed to delete sound effect' });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { id, name, slug, description, icon } = req.body;
      if (!id || !name || !slug) {
        return res.status(400).json({ error: 'id, name, and slug are required' });
      }
      const newCat = {
        id,
        name,
        slug,
        description: description || '',
        icon: icon || 'folder',
        count: 0,
        soundEffectsCount: 0,
        subcategories: [],
      };
      const created = await SoundEffectRepository.createCategory(newCat);
      return res.status(201).json(created);
    } catch (error) {
      console.error('Error in createCategory:', error);
      return res.status(500).json({ error: 'Failed to create category' });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const updates = req.body;
      const updated = await SoundEffectRepository.updateCategory(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(200).json(updated);
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return res.status(500).json({ error: 'Failed to update category' });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const success = await SoundEffectRepository.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(200).json({ success: true, message: `Deleted category ${id}` });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  static async createSubcategory(req: Request, res: Response) {
    try {
      const categoryId = String(req.params.categoryId);
      const { id, name, slug } = req.body;
      if (!id || !name || !slug) {
        return res.status(400).json({ error: 'id, name, and slug are required' });
      }
      const newSub = {
        id,
        name,
        slug,
        count: 0,
        soundEffectsCount: 0,
      };
      const created = await SoundEffectRepository.createSubcategory(categoryId, newSub);
      if (!created) {
        return res.status(404).json({ error: 'Parent category not found' });
      }
      return res.status(201).json(created);
    } catch (error) {
      console.error('Error in createSubcategory:', error);
      return res.status(500).json({ error: 'Failed to create subcategory' });
    }
  }

  static async updateSubcategory(req: Request, res: Response) {
    try {
      const categoryId = String(req.params.categoryId);
      const subId = String(req.params.subId);
      const updates = req.body;
      const updated = await SoundEffectRepository.updateSubcategory(categoryId, subId, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Subcategory or category not found' });
      }
      return res.status(200).json(updated);
    } catch (error) {
      console.error('Error in updateSubcategory:', error);
      return res.status(500).json({ error: 'Failed to update subcategory' });
    }
  }

  static async deleteSubcategory(req: Request, res: Response) {
    try {
      const categoryId = String(req.params.categoryId);
      const subId = String(req.params.subId);
      const success = await SoundEffectRepository.deleteSubcategory(categoryId, subId);
      if (!success) {
        return res.status(404).json({ error: 'Subcategory or category not found' });
      }
      return res.status(200).json({ success: true, message: `Deleted subcategory ${subId}` });
    } catch (error) {
      console.error('Error in deleteSubcategory:', error);
      return res.status(500).json({ error: 'Failed to delete subcategory' });
    }
  }
}
