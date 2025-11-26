// Mapping des catégories : ID -> slug
export const categoryIdToSlug: Record<number, string> = {
  1: 'robes-mariee',
  2: 'beaute',
  3: 'budget',
  4: 'ceremonie-reception',
  5: 'decoration',
  6: 'gastronomie',
  7: 'inspiration',
  8: 'papeterie-details',
  9: 'photo-video',
  10: 'prestataires',
  11: 'tendances',
  12: 'voyage-noces',
}

// Mapping inverse : slug -> ID
export const categorySlugToId: Record<string, number> = {
  'robes-mariee': 1,
  'beaute': 2,
  'budget': 3,
  'ceremonie-reception': 4,
  'decoration': 5,
  'gastronomie': 6,
  'inspiration': 7,
  'papeterie-details': 8,
  'photo-video': 9,
  'prestataires': 10,
  'tendances': 11,
  'voyage-noces': 12,
}

// Noms des catégories
export const categoryNames: Record<string, string> = {
  'robes-mariee': 'Robes de Mariée',
  'beaute': 'Beauté',
  'budget': 'Budget',
  'ceremonie-reception': 'Cérémonie & Réception',
  'decoration': 'Décoration',
  'gastronomie': 'Gastronomie',
  'inspiration': 'Inspiration',
  'papeterie-details': 'Papeterie & Détails',
  'photo-video': 'Photo & Vidéo',
  'prestataires': 'Prestataires',
  'tendances': 'Tendances',
  'voyage-noces': 'Voyage de Noces',
}

