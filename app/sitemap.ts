import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { regionsData } from '@/lib/regions'
import { supabase } from '@/lib/supabase'

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
  // Utiliser le client Supabase de lib/supabase.ts qui fonctionne déjà
  try {
    // Récupérer tous les articles publiés (avec pagination si nécessaire)
    let articlesPage = 0
    const articlesPageSize = 1000
    let allArticles: any[] = []
    let hasMoreArticles = true

    console.log('[Sitemap] Fetching articles from Supabase...')
    while (hasMoreArticles) {
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('slug, updated_at, created_at')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .range(articlesPage * articlesPageSize, (articlesPage + 1) * articlesPageSize - 1)

      if (articlesError) {
        console.error('[Sitemap] Error fetching articles:', articlesError)
        console.error('[Sitemap] Error details:', {
          message: articlesError.message,
          code: articlesError.code,
          details: articlesError.details,
          hint: articlesError.hint,
        })
        hasMoreArticles = false
      } else if (articles && articles.length > 0) {
        console.log(`[Sitemap] Fetched page ${articlesPage + 1}: ${articles.length} articles`)
        allArticles = allArticles.concat(articles)
        articlesPage++
        hasMoreArticles = articles.length === articlesPageSize
      } else {
        console.log(`[Sitemap] No more articles (page ${articlesPage + 1} returned empty)`)
        hasMoreArticles = false
      }
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
        console.warn('[Sitemap] No articles found - this may indicate an issue with Supabase connection or RLS policies')
        console.warn('[Sitemap] Check if articles exist in the database and if RLS policies allow public read access')
      }

    // Récupérer toutes les fiches de prestataires (avec pagination)
    let providersPage = 0
    const providersPageSize = 1000
    let allProviders: any[] = []
    let hasMoreProviders = true

    console.log('[Sitemap] Fetching providers from Supabase...')
    while (hasMoreProviders) {
      const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('slug, updated_at, created_at')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .range(providersPage * providersPageSize, (providersPage + 1) * providersPageSize - 1)

      if (providersError) {
        console.error('[Sitemap] Error fetching providers:', providersError)
        console.error('[Sitemap] Error details:', {
          message: providersError.message,
          code: providersError.code,
          details: providersError.details,
          hint: providersError.hint,
        })
        hasMoreProviders = false
      } else if (providers && providers.length > 0) {
        console.log(`[Sitemap] Fetched page ${providersPage + 1}: ${providers.length} providers`)
        allProviders = allProviders.concat(providers)
        providersPage++
        hasMoreProviders = providers.length === providersPageSize
      } else {
        console.log(`[Sitemap] No more providers (page ${providersPage + 1} returned empty)`)
        hasMoreProviders = false
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
        console.warn('[Sitemap] No providers found - this may indicate an issue with Supabase connection or RLS policies')
        console.warn('[Sitemap] Check if providers exist in the database and if RLS policies allow public read access')
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

