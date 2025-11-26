import { createClient } from '@supabase/supabase-js'
import { categorySlugToId } from './categories'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Interface pour les soumissions de contact
export interface ContactSubmission {
  id?: number
  name: string
  email: string
  request_type: string
  subject: string
  message: string
  created_at?: string
}

// Interface pour les abonnements newsletter
export interface NewsletterSubscription {
  id?: number
  email: string
  source?: string
  subscribed_at?: string
  status?: string
  created_at?: string
  updated_at?: string
}

// Fonction pour enregistrer une soumission de contact
export async function submitContactForm(data: Omit<ContactSubmission, 'id' | 'created_at'>) {
  // Structure de données correspondant au formulaire de contact
  const insertData = {
    name: data.name,           // Nom complet
    email: data.email,         // Email
    request_type: data.request_type,  // Type de demande
    subject: data.subject,     // Sujet
    message: data.message,     // Message
  }

  const { data: submission, error } = await supabase
    .from('mariage_parfait_contact_submissions')
    .insert([insertData])
    .select()
    .single()

  if (error) {
    console.error('Error submitting contact form:', error)
    return { 
      success: false, 
      error: error.message, 
      data: null 
    }
  }

  return { success: true, error: null, data: submission }
}

// Types pour les articles (structure réelle de Supabase)
export interface Article {
  id: number
  created_at: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string | null
  category_id: number
  author: string
  meta_description: string
  keywords: string
  views: number
  likes: number
  read_time: string // Format "3 min"
}

// Fonction pour récupérer tous les articles
export async function getArticles(category?: string, limit = 30, offset = 0, searchQuery?: string) {
  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== 'all') {
    // Convertir le slug de catégorie en ID
    const categoryId = categorySlugToId[category]
    if (categoryId) {
      query = query.eq('category_id', categoryId)
      console.log(`[getArticles] Filtering by category: "${category}" -> ID: ${categoryId}`)
    } else {
      console.warn(`[getArticles] Category slug "${category}" not found in categorySlugToId mapping`)
      console.log(`[getArticles] Available categories:`, Object.keys(categorySlugToId))
    }
  }

  // Recherche dans le titre, l'excerpt et le contenu
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`
    query = query.or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getArticles] Error fetching articles:', error)
    return []
  }

  console.log(`[getArticles] Found ${data?.length || 0} articles for category: ${category || 'all'}`)
  if (data && data.length > 0) {
    console.log(`[getArticles] Sample article category_ids:`, data.slice(0, 3).map(a => ({ id: a.id, category_id: a.category_id })))
  }
  return data as Article[]
}

// Fonction pour récupérer un article par slug
export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    return null
  }

  return data as Article
}

// Fonction pour compter les articles
export async function getArticlesCount(category?: string, searchQuery?: string) {
  let query = supabase.from('articles').select('*', { count: 'exact', head: true })

  if (category && category !== 'all') {
    // Convertir le slug de catégorie en ID
    const categoryId = categorySlugToId[category]
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
  }

  // Recherche dans le titre, l'excerpt et le contenu
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`
    query = query.or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`)
  }

  const { count, error } = await query

  if (error) {
    console.error('Error counting articles:', error)
    return 0
  }

  return count || 0
}

// Types pour les catégories de prestataires
export interface ProviderCategory {
  id: number
  name: string
  slug: string
  created_at: string
}

// Types pour les prestataires (structure réelle de Supabase)
export interface Provider {
  id: number
  name: string
  slug: string
  category_id: number
  logo_url: string | null
  summary: string | null
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  gallery_urls: string[] | null
  created_at: string
  code_region: string | null
  code_departement: string | null
  city: string | null
  postal_code: string | null
  google_reviews_url: string | null
  google_rating: number | null
  google_reviews_count: number | null
  is_featured: boolean
  user_id: number | null
  status: string
  gallery_images: string[] | null
  video_url: string | null
  views: number
  phone_clicks: number
  website_clicks: number
  street_number: string | null
  street_name: string | null
  address: string | null
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  tiktok_url: string | null
  is_boosted: boolean
}

// Fonction pour récupérer toutes les catégories de prestataires
export async function getProviderCategories() {
  const { data, error } = await supabase
    .from('provider_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching provider categories:', error)
    return []
  }

  return data as ProviderCategory[]
}

// Fonction pour récupérer les prestataires par département et catégorie
export async function getProvidersByDepartment(
  departmentCode: string,
  categoryId?: number
) {
  // Normaliser le code département (enlever les zéros initiaux si présents)
  const normalizedCode = departmentCode.replace(/^0+/, '') || departmentCode
  const codeWithZero = normalizedCode.padStart(2, '0') // Format "69" -> "69", "9" -> "09"
  
  // Essayer avec le code tel quel d'abord
  let query = supabase
    .from('providers')
    .select('*')
    .in('code_departement', [departmentCode, normalizedCode, codeWithZero])
    // Ne pas filtrer par status pour l'instant - afficher tous les prestataires
    .order('is_featured', { ascending: false }) // Les featured en premier
    .order('name', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching providers:', error)
    // Essayer une requête plus simple en cas d'erreur
    let simpleQuery = supabase
      .from('providers')
      .select('*')
      .eq('code_departement', departmentCode)
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })
    
    if (categoryId) {
      simpleQuery = simpleQuery.eq('category_id', categoryId)
    }
    
    const { data: simpleData, error: simpleError } = await simpleQuery
    
    if (simpleError) {
      console.error('Error with simple query:', simpleError)
      return []
    }
    
    return simpleData as Provider[]
  }

  return data as Provider[]
}

// Fonction pour récupérer 6 prestataires premium au hasard pour un département
// IMPORTANT: Ne retourne que les fiches réellement boostées par des utilisateurs premium
// Pas de fallback vers des fiches normales
export async function getPremiumProviders(departmentCode: string, limit: number = 6) {
  // Normaliser le code département
  const normalizedCode = departmentCode.replace(/^0+/, '') || departmentCode
  const codeWithZero = normalizedCode.padStart(2, '0')
  
  // Récupérer UNIQUEMENT les prestataires boostés (mise en avant)
  // Ces fiches doivent avoir été explicitement boostées par un utilisateur avec un abonnement actif
  let query = supabase
    .from('providers')
    .select('*')
    .in('code_departement', [departmentCode, normalizedCode, codeWithZero])
    .eq('is_boosted', true) // Seulement les fiches boostées
    // Ne pas filtrer par status pour l'instant
    .order('views', { ascending: false })
    .limit(limit * 2)

  const { data: boostedData, error: boostedError } = await query

  if (boostedError) {
    console.error('Error fetching premium providers:', boostedError)
    return []
  }

  // Si on a des boostés, les utiliser
  if (boostedData && boostedData.length > 0) {
    const shuffled = [...boostedData].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit) as Provider[]
  }

  // Pas de fallback - si aucune fiche n'est boostée, retourner un tableau vide
  // La section premium ne s'affichera pas sur la page
  return []
}

// Fonction pour récupérer les prestataires groupés par catégorie
export async function getProvidersGroupedByCategory(departmentCode: string) {
  const providers = await getProvidersByDepartment(departmentCode)
  const categories = await getProviderCategories()

  const grouped: Record<number, { category: ProviderCategory; providers: Provider[] }> = {}

  providers.forEach((provider) => {
    if (!grouped[provider.category_id]) {
      const category = categories.find(c => c.id === provider.category_id)
      if (category) {
        grouped[provider.category_id] = {
          category,
          providers: [],
        }
      }
    }
    if (grouped[provider.category_id]) {
      grouped[provider.category_id].providers.push(provider)
    }
  })

  // Trier par nom de catégorie
  return Object.values(grouped).sort((a, b) => 
    a.category.name.localeCompare(b.category.name)
  )
}

// Fonction pour récupérer un prestataire par slug
export async function getProviderBySlug(slug: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', slug)
    // Ne pas filtrer par status pour l'instant
    .single()

  if (error) {
    console.error('Error fetching provider:', error)
    return null
  }

  return data as Provider
}

// Fonction pour rechercher un prestataire par email ou téléphone
// Note: Cette fonction doit être utilisée côté client avec getSupabaseClient()
export async function searchProviderByEmailOrPhone(
  emailOrPhone: string,
  supabaseClient: any
): Promise<Provider | null> {
  if (!emailOrPhone || !emailOrPhone.trim()) {
    return null
  }

  const searchTerm = emailOrPhone.trim().toLowerCase()

  // Vérifier si c'est un email
  const isEmail = searchTerm.includes('@')

  if (isEmail) {
    // Recherche par email
    const { data, error } = await supabaseClient
      .from('providers')
      .select('*')
      .ilike('email', searchTerm)
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return data as Provider
  } else {
    // Recherche par téléphone - normaliser le numéro
    // Importer la fonction de normalisation
    const { normalizeFrenchPhone, generatePhoneVariants } = await import('./phone-utils')
    const normalizedPhone = normalizeFrenchPhone(searchTerm)
    const variants = generatePhoneVariants(searchTerm)

    // Rechercher avec toutes les variantes
    const { data, error } = await supabaseClient
      .from('providers')
      .select('*')
      .or(variants.map(v => `phone.ilike.%${v}%`).join(','))
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    // Vérifier que le numéro correspond vraiment (normaliser aussi celui de la base)
    const providerPhone = data.phone ? normalizeFrenchPhone(data.phone) : ''
    if (providerPhone === normalizedPhone || variants.includes(providerPhone)) {
      return data as Provider
    }

    return null
  }
}

