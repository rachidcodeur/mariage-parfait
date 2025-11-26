// Générateur d'articles automatiques pour le blog
// Un article par jour sera créé

import { categorySlugToId } from './categories'

const categories = [
  'beaute',
  'budget',
  'ceremonie-reception',
  'decoration',
  'gastronomie',
  'inspiration',
  'papeterie-details',
  'photo-video',
  'prestataires',
  'robes-mariee',
  'tendances',
  'voyage-noces',
]

const categoryTemplates: Record<string, string[]> = {
  beaute: [
    'Tendances maquillage pour mariée en {year}',
    'Les meilleurs looks beauté pour votre jour J',
    'Conseils beauté pour une mariée éclatante',
    'Maquillage de mariée : les tendances {year}',
  ],
  budget: [
    '10 idées créatives pour économiser de l\'argent sur la décoration de mariage',
    'Comment organiser un mariage magnifique avec un budget serré',
    'Les astuces pour réduire les coûts de votre mariage',
    'Budget mariage : comment bien répartir vos dépenses',
  ],
  'ceremonie-reception': [
    'Les tendances en matière de décoration de table pour les mariages en {year}',
    'Comment personnaliser votre cérémonie de mariage',
    'Les tendances des décors de chaises pour les mariages en {year}',
    'Organiser une réception de mariage inoubliable',
  ],
  decoration: [
    'Les tendances en matière de décoration de mariage pour l\'été {year}',
    '20 idées de décorations florales pour un mariage bohème chic',
    '7 façons originales de décorer votre espace de cérémonie en plein air',
    'Les 10 tendances de décoration de mariage pour l\'année à venir',
  ],
  gastronomie: [
    'Les tendances en matière de gâteaux de mariage pour l\'année à venir',
    'Les tendances culinaires incontournables pour un mariage en {year}',
    'Comment choisir le menu parfait pour votre mariage',
    'Les meilleures idées de cocktails pour votre mariage',
  ],
  inspiration: [
    'Les 10 tendances de décoration de mariage pour l\'année à venir',
    'Les tendances en matière de décorations florales pour les mariages en {year}',
    'Inspirations mariage : les thèmes tendance {year}',
    '20 idées originales pour un mariage unique',
  ],
  'papeterie-details': [
    '10 idées créatives pour personnaliser vos faire-part de mariage',
    'Illuminez votre mariage avec des détails en papier doré',
    '8 idées créatives de porte-noms pour guider vos invités avec style',
    'Les tendances en papeterie de mariage {year}',
  ],
  'photo-video': [
    'Les 10 tendances incontournables de la photographie de mariage en {year}',
    'Les 10 tendances photo et vidéo à adopter pour son mariage en {year}',
    'Comment choisir le bon photographe de mariage',
    'Les meilleurs moments à capturer lors de votre mariage',
  ],
  prestataires: [
    'Les 5 critères à prendre en compte pour choisir son traiteur de mariage',
    'Les tendances en matière de décorations florales pour les mariages en {year}',
    'Comment choisir les meilleurs prestataires pour votre mariage',
    'Guide complet pour sélectionner vos prestataires de mariage',
  ],
  'robes-mariee': [
    'Les Tendances des Robes de Mariée pour la Saison Automne-Hiver {year}',
    'Comment choisir la robe de mariée parfaite',
    'Les silhouettes de robes de mariée tendance {year}',
    'Guide pour trouver votre robe de mariée de rêve',
  ],
  tendances: [
    'Les mariages éco-responsables: Comment organiser un mariage éco-friendly',
    'Les mariages durables : comment réduire l\'impact environnemental',
    'Les tendances mariage {year} : ce qui va marquer l\'année',
    'Les nouvelles tendances du mariage moderne',
  ],
  'voyage-noces': [
    'Les 10 endroits les plus romantiques pour un voyage de noces inoubliable',
    'Comment planifier votre lune de miel de rêve',
    'Les destinations tendance pour votre voyage de noces {year}',
    'Guide complet pour organiser votre voyage de noces',
  ],
}

const descriptions: Record<string, string[]> = {
  beaute: [
    'Découvrez les dernières tendances en maquillage de mariée pour être resplendissante le jour J.',
    'Conseils d\'experts pour un look beauté parfait lors de votre mariage.',
  ],
  budget: [
    'Des astuces pratiques pour organiser un mariage magnifique sans se ruiner.',
    'Apprenez à optimiser votre budget mariage sans compromettre vos rêves.',
  ],
  'ceremonie-reception': [
    'Inspirations et conseils pour créer une cérémonie et une réception inoubliables.',
    'Tout ce qu\'il faut savoir pour organiser parfaitement votre cérémonie de mariage.',
  ],
  decoration: [
    'Idées créatives et tendances pour décorer votre mariage avec style.',
    'Découvrez les dernières tendances en décoration de mariage.',
  ],
  gastronomie: [
    'Conseils pour choisir le menu et les prestataires culinaires parfaits.',
    'Les tendances culinaires à adopter pour un mariage gastronomique réussi.',
  ],
  inspiration: [
    'Trouvez l\'inspiration pour créer le mariage de vos rêves.',
    'Des idées originales et tendances pour personnaliser votre mariage.',
  ],
  'papeterie-details': [
    'Conseils pour créer une papeterie de mariage élégante et personnalisée.',
    'Idées créatives pour les détails et la papeterie de votre mariage.',
  ],
  'photo-video': [
    'Tendances et conseils pour capturer parfaitement les moments de votre mariage.',
    'Comment choisir les meilleurs professionnels pour immortaliser votre jour J.',
  ],
  prestataires: [
    'Guide complet pour sélectionner les meilleurs prestataires de mariage.',
    'Conseils pour choisir des prestataires de qualité pour votre mariage.',
  ],
  'robes-mariee': [
    'Découvrez les tendances et conseils pour trouver la robe de mariée parfaite.',
    'Guide complet pour choisir la robe de vos rêves.',
  ],
  tendances: [
    'Les dernières tendances et innovations dans le monde du mariage.',
    'Découvrez ce qui marque l\'année en matière de mariage.',
  ],
  'voyage-noces': [
    'Inspirations et conseils pour planifier votre lune de miel de rêve.',
    'Les meilleures destinations pour un voyage de noces inoubliable.',
  ],
}

export function generateArticleContent(category: string, title: string): string {
  // Génère un contenu d'article basique
  return `
    <h2>Introduction</h2>
    <p>${title} est un sujet important pour tous les futurs mariés. Dans cet article, nous vous proposons des conseils pratiques et des idées inspirantes pour vous aider à organiser le mariage de vos rêves.</p>
    
    <h2>Les points essentiels</h2>
    <p>Que vous planifiiez un mariage intime ou une grande célébration, il est important de prendre en compte plusieurs éléments clés. Nous vous guidons à travers les étapes importantes pour réussir votre événement.</p>
    
    <h2>Conseils pratiques</h2>
    <p>Voici quelques conseils pratiques que vous pouvez appliquer dès maintenant pour faciliter l'organisation de votre mariage. Ces astuces vous permettront d'économiser du temps et de l'argent tout en créant un événement mémorable.</p>
    
    <h2>Conclusion</h2>
    <p>En suivant ces conseils et en vous inspirant des tendances actuelles, vous êtes sur la bonne voie pour créer le mariage de vos rêves. N'hésitez pas à explorer notre annuaire de prestataires pour trouver les professionnels qui vous accompagneront dans cette aventure.</p>
  `
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function generateDailyArticle() {
  const today = new Date()
  const year = today.getFullYear()
  
  // Sélectionner une catégorie de manière cyclique (basée sur le jour de l'année)
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const categoryIndex = dayOfYear % categories.length
  const category = categories[categoryIndex]
  
  // Sélectionner un template de titre
  const templates = categoryTemplates[category] || []
  const templateIndex = Math.floor(dayOfYear / categories.length) % templates.length
  const titleTemplate = templates[templateIndex] || `Article sur ${category}`
  const title = titleTemplate.replace('{year}', year.toString())
  
  // Sélectionner une description
  const descs = descriptions[category] || []
  const descIndex = Math.floor(dayOfYear / categories.length) % descs.length
  const excerpt = descs[descIndex] || `Découvrez nos conseils sur ${category}`
  
  // Générer le contenu
  const content = generateArticleContent(category, title)
  const slug = generateSlug(title)
  
  // Calculer le temps de lecture (environ 200 mots par minute)
  const wordCount = content.split(/\s+/).length
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
  const readTime = `${readTimeMinutes} min`
  
  // Utiliser le mapping depuis categories.ts pour garantir la cohérence
  const categoryId = categorySlugToId[category] || 7 // Default to inspiration (ID 7)
  
  return {
    title,
    slug,
    excerpt,
    content,
    image: null,
    category_id: categoryId,
    author: 'Rédaction Mariage Parfait',
    meta_description: excerpt,
    keywords: `${category}, mariage, ${year}`,
    views: 0,
    likes: 0,
    read_time: readTime,
  }
}

