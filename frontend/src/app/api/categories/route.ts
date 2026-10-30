import { NextRequest, NextResponse } from 'next/server';
import { SoundEffectRepository } from '@/lib/data/sfx-repository';

export async function GET() {
  try {
    const categories = await SoundEffectRepository.getCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create-category') {
      const name = body.category?.name || body.name;
      const slug = body.category?.slug || body.slug;
      if (!name || !slug) {
        return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
      }

      const newCategory = {
        id: body.category?.id || body.id || `cat-${Date.now()}`,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        count: 0,
        subcategories: [],
      };

      const created = await SoundEffectRepository.createCategory(newCategory);
      return NextResponse.json(created, { status: 201 });
    }

    if (action === 'create-subcategory') {
      const categoryId = body.categoryId;
      const name = body.subcategory?.name || body.name;
      const slug = body.subcategory?.slug || body.slug;
      if (!categoryId || !name || !slug) {
        return NextResponse.json({ error: 'categoryId, name and slug are required' }, { status: 400 });
      }

      const newSub = {
        id: body.subcategory?.id || body.id || `sub-${Date.now()}`,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        count: 0,
      };

      const created = await SoundEffectRepository.createSubcategory(categoryId, newSub);
      if (!created) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }
      return NextResponse.json(created, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'update-category') {
      const id = body.id;
      const updates = body.updates || { name: body.name, slug: body.slug };
      if (!id || !updates) {
        return NextResponse.json({ error: 'id and updates are required' }, { status: 400 });
      }

      const updated = await SoundEffectRepository.updateCategory(id, updates);
      if (!updated) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json(updated, { status: 200 });
    }

    if (action === 'update-subcategory') {
      const categoryId = body.categoryId;
      const subId = body.subId || body.id;
      const updates = body.updates || { name: body.name, slug: body.slug };
      if (!categoryId || !subId || !updates) {
        return NextResponse.json({ error: 'categoryId, subId and updates are required' }, { status: 400 });
      }

      const updated = await SoundEffectRepository.updateSubcategory(categoryId, subId, updates);
      if (!updated) {
        return NextResponse.json({ error: 'Category or subcategory not found' }, { status: 404 });
      }
      return NextResponse.json(updated, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in PUT /api/categories:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, id, categoryId, subId } = body;

    if (action === 'delete-subcategory') {
      if (!categoryId || !subId) {
        return NextResponse.json({ error: 'categoryId and subId are required' }, { status: 400 });
      }

      const deleted = await SoundEffectRepository.deleteSubcategory(categoryId, subId);
      if (!deleted) {
        return NextResponse.json({ error: 'Category or subcategory not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (action === 'delete-category' || (!action && id)) {
      const targetId = id || body.targetId;
      if (!targetId) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
      }

      const deleted = await SoundEffectRepository.deleteCategory(targetId);
      if (!deleted) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in DELETE /api/categories:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
