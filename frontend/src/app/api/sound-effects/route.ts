import { NextRequest, NextResponse } from 'next/server';
import { SoundEffectRepository } from '@/lib/data/sfx-repository';
import { SortOption } from '@/types/sfx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    const subcategory = searchParams.get('subcategory') || '';
    const sort = (searchParams.get('sort') as SortOption) || 'most-popular';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const result = await SoundEffectRepository.query({
      q,
      category,
      subcategory,
      sort,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    // If Next.js interrupted prerendering to mark the route as dynamic, rethrow
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('Error fetching sound effects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while querying sound effects' },
      { status: 500 }
    );
  }
}
