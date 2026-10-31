import { SOUND_EFFECTS_DATA } from '../data/sound-effects.js';
import { CATEGORIES_DATA } from '../data/categories.js';
import { FilterParams, PaginatedSoundEffectsResponse, SoundEffect, Category, SubCategory } from '../types/sfx.js';

const runtimeItems: SoundEffect[] = [...SOUND_EFFECTS_DATA];
let runtimeCategories: Category[] = [...CATEGORIES_DATA];

export class SoundEffectRepository {
  static async query(params: FilterParams = {}): Promise<PaginatedSoundEffectsResponse> {
    const {
      q = '',
      category = 'all',
      subcategory = '',
      sort = 'most-popular',
      page = 1,
      limit = 12,
    } = params;

    let results = [...runtimeItems];

    if (category && category !== 'all') {
      results = results.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (subcategory) {
      results = results.filter((item) => item.subcategory.toLowerCase() === subcategory.toLowerCase());
    }

    if (q && q.trim()) {
      const cleanQ = q.trim().toLowerCase();
      results = results.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(cleanQ);
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(cleanQ));
        const subcategoryMatch = item.subcategory.toLowerCase().includes(cleanQ);
        return titleMatch || tagMatch || subcategoryMatch;
      });
    }

    switch (sort) {
      case 'most-favorites':
        results.sort((a, b) => {
          const favA =
            typeof a.favoritesCount === 'number'
              ? a.favoritesCount
              : Math.max(12, Math.round(a.downloadsCount * 0.18));
          const favB =
            typeof b.favoritesCount === 'number'
              ? b.favoritesCount
              : Math.max(12, Math.round(b.downloadsCount * 0.18));
          return favB - favA || b.downloadsCount - a.downloadsCount;
        });
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name-asc':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        results.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'most-popular':
      default:
        results.sort((a, b) => b.popularity - a.popularity || b.downloadsCount - a.downloadsCount);
        break;
    }

    const total = results.length;
    const currentPage = Math.max(1, Number(page));
    const pageSize = Math.max(1, Math.min(50, Number(limit)));
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = results.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      page: currentPage,
      pageSize,
      totalPages,
      categorySummary: {
        category: typeof category === 'string' ? category : 'all',
        subcategory,
        totalCount: total,
      },
    };
  }

  static async getById(id: string): Promise<SoundEffect | null> {
    const found = runtimeItems.find((item) => item.id === id || item.slug === id);
    return found || null;
  }

  static async getCategories(): Promise<Category[]> {
    return runtimeCategories;
  }

  static async createCategory(category: Category): Promise<Category> {
    runtimeCategories.push(category);
    return category;
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = runtimeCategories.findIndex((c) => c.id === id || c.slug === id);
    if (idx !== -1) {
      runtimeCategories[idx] = { ...runtimeCategories[idx], ...updates };
      return runtimeCategories[idx];
    }
    return null;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const idx = runtimeCategories.findIndex((c) => c.id === id || c.slug === id);
    if (idx !== -1) {
      runtimeCategories.splice(idx, 1);
      return true;
    }
    return false;
  }

  static async createSubcategory(categoryId: string, sub: SubCategory): Promise<SubCategory | null> {
    const cat = runtimeCategories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (cat) {
      if (!cat.subcategories) cat.subcategories = [];
      cat.subcategories.push(sub);
      return sub;
    }
    return null;
  }

  static async updateSubcategory(
    categoryId: string,
    subId: string,
    updates: Partial<SubCategory>
  ): Promise<SubCategory | null> {
    const cat = runtimeCategories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (cat && cat.subcategories) {
      const idx = cat.subcategories.findIndex((s) => s.id === subId || s.slug === subId);
      if (idx !== -1) {
        cat.subcategories[idx] = { ...cat.subcategories[idx], ...updates };
        return cat.subcategories[idx];
      }
    }
    return null;
  }

  static async deleteSubcategory(categoryId: string, subId: string): Promise<boolean> {
    const cat = runtimeCategories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (cat && cat.subcategories) {
      const idx = cat.subcategories.findIndex((s) => s.id === subId || s.slug === subId);
      if (idx !== -1) {
        cat.subcategories.splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  static async incrementDownload(id: string): Promise<SoundEffect | null> {
    const item = runtimeItems.find((i) => i.id === id || i.slug === id);
    if (item) {
      item.downloadsCount += 1;
      return { ...item };
    }
    return null;
  }

  static async create(sfx: SoundEffect): Promise<SoundEffect> {
    runtimeItems.unshift(sfx);
    return sfx;
  }

  static async delete(id: string): Promise<boolean> {
    const index = runtimeItems.findIndex((i) => i.id === id || i.slug === id);
    if (index !== -1) {
      runtimeItems.splice(index, 1);
      return true;
    }
    return false;
  }
}
