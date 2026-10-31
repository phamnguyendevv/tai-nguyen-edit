export type CategorySlug =
  | 'all'
  | 'ambience'
  | 'foley'
  | 'genre'
  | 'musical'
  | 'realistic'
  | 'transitions'
  | 'voiceover'
  | (string & {});

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  count: number;
  subcategories?: SubCategory[];
}

export interface SoundEffect {
  id: string;
  title: string;
  slug: string;
  category: CategorySlug;
  subcategory: string;
  audioUrl: string;
  duration: number; // in seconds
  waveform: number[]; // normalized 0.1 - 1.0 amplitude values
  tags: string[];
  downloadsCount: number;
  favoritesCount?: number;
  popularity: number;
  createdAt: string;
  fileSizeBytes: number;
  format: string;
  license: string;
}

export type SortOption =
  | 'most-popular'
  | 'most-favorites'
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc';

export interface FilterParams {
  q?: string;
  category?: CategorySlug | string;
  subcategory?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
  favoritesOnly?: boolean;
}

export interface PaginatedSoundEffectsResponse {
  items: SoundEffect[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categorySummary?: {
    category: string;
    subcategory?: string;
    totalCount: number;
  };
}

export interface PlayerState {
  currentTrack: SoundEffect | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}
