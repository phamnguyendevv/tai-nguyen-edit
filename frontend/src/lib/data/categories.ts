import { Category } from '@/types/sfx';

export const CATEGORIES_DATA: Category[] = [
  {
    id: 'cat-all',
    name: 'All Sound Effects',
    slug: 'all',
    count: 28,
  },
  {
    id: 'cat-ambience',
    name: 'Ambience',
    slug: 'ambience',
    count: 1,
    subcategories: [
      { id: 'sub-rain', name: 'Rain and Storms', slug: 'rain-storms', count: 1 },
      { id: 'sub-nature', name: 'Nature and Forest', slug: 'nature-forest', count: 0 },
      { id: 'sub-urban-amb', name: 'Urban Atmosphere', slug: 'urban-atmosphere', count: 0 },
      { id: 'sub-scifi-drone', name: 'Sci-Fi Ambience', slug: 'scifi-ambience', count: 0 },
    ],
  },
  {
    id: 'cat-foley',
    name: 'Foley',
    slug: 'foley',
    count: 5,
    subcategories: [
      { id: 'sub-wood', name: 'Doors and Wood', slug: 'doors-wood', count: 1 },
      { id: 'sub-steps', name: 'Footsteps', slug: 'footsteps', count: 1 },
      { id: 'sub-cloth', name: 'Cloth and Movement', slug: 'cloth-movement', count: 1 },
      { id: 'sub-impacts', name: 'Body and Hits', slug: 'body-hits', count: 1 },
      { id: 'sub-keys', name: 'Keys and Metal', slug: 'keys-metal', count: 1 },
    ],
  },
  {
    id: 'cat-genre',
    name: 'Genre',
    slug: 'genre',
    count: 1,
    subcategories: [
      { id: 'sub-scifi', name: 'Sci-Fi Future', slug: 'scifi-future', count: 1 },
      { id: 'sub-horror', name: 'Horror and Thriller', slug: 'horror-thriller', count: 0 },
      { id: 'sub-fantasy', name: 'Fantasy and Magic', slug: 'fantasy-magic', count: 0 },
    ],
  },
  {
    id: 'cat-musical',
    name: 'Musical',
    slug: 'musical',
    count: 1,
    subcategories: [
      { id: 'sub-cinematic-brass', name: 'Cinematic Brass', slug: 'cinematic-brass', count: 1 },
      { id: 'sub-stingers', name: 'Stingers and Accents', slug: 'stingers-accents', count: 0 },
      { id: 'sub-drones', name: 'Sub Bass and Drones', slug: 'sub-bass-drones', count: 0 },
    ],
  },
  {
    id: 'cat-realistic',
    name: 'Realistic',
    slug: 'realistic',
    count: 18,
    subcategories: [
      { id: 'sub-wildlife', name: 'Wildlife', slug: 'wildlife', count: 12 },
      { id: 'sub-machines', name: 'Machines and Tools', slug: 'machines-tools', count: 1 },
      { id: 'sub-household', name: 'Household Objects', slug: 'household-objects', count: 1 },
      { id: 'sub-cars', name: 'Cars and Airplanes', slug: 'cars-airplanes', count: 1 },
      { id: 'sub-water', name: 'Water', slug: 'water', count: 1 },
      { id: 'sub-electronic', name: 'Electronic Devices', slug: 'electronic-devices', count: 1 },
      { id: 'sub-pets', name: 'Pets and Farm Animals', slug: 'pets-farm-animals', count: 1 },
    ],
  },
  {
    id: 'cat-voiceover',
    name: 'Voiceover',
    slug: 'voiceover',
    count: 3,
    subcategories: [
      { id: 'sub-ai-speech', name: 'AI Speech & Narration', slug: 'ai-speech', count: 1 },
      { id: 'sub-cinematic-vocals', name: 'Cinematic & Trailer Vocals', slug: 'cinematic-vocals', count: 1 },
      { id: 'sub-character-vocals', name: 'Character & Game Voices', slug: 'character-voices', count: 1 },
    ],
  },
  {
    id: 'cat-transitions',
    name: 'Transitions',
    slug: 'transitions',
    count: 2,
    subcategories: [
      { id: 'sub-whoosh', name: 'Whooshes', slug: 'whooshes', count: 1 },
      { id: 'sub-impact', name: 'Cinematic Impacts', slug: 'cinematic-impacts', count: 1 },
      { id: 'sub-glitch', name: 'Glitches', slug: 'glitches', count: 0 },
    ],
  },
];
