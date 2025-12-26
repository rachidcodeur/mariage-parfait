import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { regionsData } from '@/lib/regions'

// URL de base du site (à configurer selon votre domaine de production)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

// Forcer le rendu dynamique pour le sitemap
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  console.log('[Sitemap] Starting sitemap generation...')

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

  // Si Supabase est configuré, récupérer les articles et les fiches
  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    try {
      // Récupérer tous les articles publiés
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('slug, updated_at, created_at')
        .not('slug', 'is', null) // Seulement les articles avec un slug
        .order('created_at', { ascending: false })

      if (articlesError) {
        console.error('[Sitemap] Error fetching articles:', articlesError)
      } else if (articles) {
        console.log(`[Sitemap] Found ${articles.length} articles to include`)
        articles.forEach((article) => {
          sitemapEntries.push({
            url: `${baseUrl}/blog/${article.slug}`,
            lastModified: article.updated_at ? new Date(article.updated_at) : new Date(article.created_at),
            changeFrequency: 'weekly',
            priority: 0.8,
          })
        })
      }

      // Récupérer toutes les fiches de prestataires
      // Ne pas filtrer par status car la colonne peut ne pas exister ou avoir des valeurs différentes
      // Inclure tous les prestataires qui ont un slug (donc publiés)
      const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('slug, updated_at, created_at')
        .not('slug', 'is', null) // Seulement les prestataires avec un slug (publiés)
        .order('created_at', { ascending: false })

      if (providersError) {
        console.error('[Sitemap] Error fetching providers:', providersError)
      } else if (providers) {
        console.log(`[Sitemap] Found ${providers.length} providers to include`)
        providers.forEach((provider) => {
          sitemapEntries.push({
            url: `${baseUrl}/annuaire/prestataire/${provider.slug}`,
            lastModified: provider.updated_at ? new Date(provider.updated_at) : new Date(provider.created_at),
            changeFrequency: 'monthly',
            priority: 0.7,
          })
        })
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
    } catch (error) {
      console.error('[Sitemap] Error generating sitemap:', error)
    }
  } else {
    console.warn('[Sitemap] Supabase not configured - only static pages will be included')
  }

  console.log(`[Sitemap] Generated sitemap with ${sitemapEntries.length} entries`)
  
  // Vérifier que le sitemap ne dépasse pas la limite recommandée de 50 000 URLs
  if (sitemapEntries.length > 50000) {
    console.warn(`[Sitemap] WARNING: Sitemap contains ${sitemapEntries.length} entries, which exceeds the recommended limit of 50,000. Consider splitting into multiple sitemaps.`)
  }
  
  return sitemapEntries
}

