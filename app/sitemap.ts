import { MetadataRoute } from 'next'
import { regionsData } from '@/lib/regions'
import { getArticles, supabase } from '@/lib/supabase'

// URL de base du site (à configurer selon votre domaine de production)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

// Forcer le rendu dynamique pour le sitemap
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Utiliser SERVICE_ROLE_KEY si disponible, sinon fallback vers ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  console.log('[Sitemap] Starting sitemap generation...')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[Sitemap] Using ANON_KEY instead of SERVICE_ROLE_KEY (may have RLS limitations)')
  }

  // Pages statiques
  sitemapEntries.push(
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/annuaire`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  )

  // Récupérer les articles et prestataires depuis Supabase
  // Utiliser les fonctions existantes qui fonctionnent déjà
  try {
    // Récupérer tous les articles en utilisant la fonction getArticles qui fonctionne
    console.log('[Sitemap] Fetching articles from Supabase using getArticles...')
    let allArticles: any[] = []
    let articlesOffset = 0
    const articlesLimit = 1000
    
    while (true) {
      const articles = await getArticles('all', articlesLimit, articlesOffset)
      if (!articles || articles.length === 0) {
        break
      }
      console.log(`[Sitemap] Fetched ${articles.length} articles (offset: ${articlesOffset})`)
      allArticles = allArticles.concat(articles)
      if (articles.length < articlesLimit) {
        break
      }
      articlesOffset += articlesLimit
    }

    if (allArticles.length > 0) {
      console.log(`[Sitemap] Found ${allArticles.length} articles to include`)
      allArticles.forEach((article) => {
        sitemapEntries.push({
          url: `${baseUrl}/blog/${article.slug}`,
          lastModified: article.updated_at ? new Date(article.updated_at) : new Date(article.created_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    } else {
      console.warn('[Sitemap] No articles found')
    }

    // Récupérer toutes les fiches de prestataires (avec pagination simplifiée)
    console.log('[Sitemap] Fetching providers from Supabase...')
    let allProviders: any[] = []
    let providersOffset = 0
    const providersLimit = 1000
    
    while (true) {
      const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('slug, updated_at, created_at')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .range(providersOffset, providersOffset + providersLimit - 1)

      if (providersError) {
        console.error('[Sitemap] Error fetching providers:', providersError)
        console.error('[Sitemap] Error details:', {
          message: providersError.message,
          code: providersError.code,
          details: providersError.details,
          hint: providersError.hint,
        })
        break
      } else if (providers && providers.length > 0) {
        console.log(`[Sitemap] Fetched ${providers.length} providers (offset: ${providersOffset})`)
        allProviders = allProviders.concat(providers)
        if (providers.length < providersLimit) {
          break
        }
        providersOffset += providersLimit
      } else {
        console.log(`[Sitemap] No more providers (offset: ${providersOffset})`)
        break
      }
    }

    if (allProviders.length > 0) {
      console.log(`[Sitemap] Found ${allProviders.length} providers to include`)
      allProviders.forEach((provider) => {
        sitemapEntries.push({
          url: `${baseUrl}/annuaire/prestataire/${provider.slug}`,
          lastModified: provider.updated_at ? new Date(provider.updated_at) : new Date(provider.created_at),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      })
    } else {
      console.warn('[Sitemap] No providers found')
    }

      // Récupérer les pages de catégories de blog
      const categories = [
        'robes-mariee',
        'beaute',
        'budget',
        'ceremonie-reception',
        'decoration',
        'gastronomie',
        'inspiration',
        'papeterie-details',
        'photo-video',
        'prestataires',
        'tendances',
        'voyage-noces',
      ]

      categories.forEach((category) => {
        sitemapEntries.push({
          url: `${baseUrl}/blog?category=${category}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        })
      })

      // Ajouter toutes les pages régionales de l'annuaire
      try {
        Object.keys(regionsData).forEach((regionSlug) => {
          sitemapEntries.push({
            url: `${baseUrl}/annuaire/${regionSlug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          })

          // Ajouter toutes les pages départementales pour chaque région
          const region = regionsData[regionSlug]
          if (region && region.departments) {
            region.departments.forEach((department) => {
              sitemapEntries.push({
                url: `${baseUrl}/annuaire/${regionSlug}/${department.code}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
              })
            })
          }
        })
        console.log(`[Sitemap] Added ${Object.keys(regionsData).length} regions and ${Object.values(regionsData).reduce((sum, r) => sum + r.departments.length, 0)} departments`)
      } catch (error) {
        console.error('[Sitemap] Error adding regions/departments:', error)
      }
  } catch (error: any) {
    console.error('[Sitemap] Error generating sitemap:', error)
    console.error('[Sitemap] Error details:', {
      message: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    })
  }

  console.log(`[Sitemap] Generated sitemap with ${sitemapEntries.length} entries`)
  
  // Vérifier que le sitemap ne dépasse pas la limite recommandée de 50 000 URLs
  if (sitemapEntries.length > 50000) {
    console.warn(`[Sitemap] WARNING: Sitemap contains ${sitemapEntries.length} entries, which exceeds the recommended limit of 50,000. Consider splitting into multiple sitemaps.`)
  }
  
  return sitemapEntries
}

