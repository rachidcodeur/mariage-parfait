import { MetadataRoute } from 'next'
import { regionsData } from '@/lib/regions'
import { getArticles, supabase } from '@/lib/supabase'

// URL de base du site (à configurer selon votre domaine de production)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

// Forcer le rendu dynamique pour le sitemap
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  console.log('[Sitemap] Starting sitemap generation...')
  console.log('[Sitemap] Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('[Sitemap] Service role key configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('[Sitemap] Anon key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('[Sitemap] Using supabase client from lib/supabase.ts:', !!supabase)

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
    // Isoler dans un try/catch séparé pour mieux diagnostiquer
    try {
      console.log('[Sitemap] Fetching providers from Supabase...')
      console.log('[Sitemap] Supabase client exists:', !!supabase)
      
      let allProviders: any[] = []
      let providersPageOffset = 0
      const providersPageLimit = 1000
      let providersPageCount = 0
      const maxProvidersPages = 10 // Limite de sécurité pour éviter les boucles infinies
      
      while (providersPageCount < maxProvidersPages) {
        console.log(`[Sitemap] Fetching providers page ${providersPageCount + 1} (offset: ${providersPageOffset})`)
        
        const { data: providers, error: providersError } = await supabase
          .from('providers')
          .select('slug, updated_at, created_at')
          .not('slug', 'is', null)
          .order('created_at', { ascending: false })
          .range(providersPageOffset, providersPageOffset + providersPageLimit - 1)

        if (providersError) {
          console.error('[Sitemap] Error fetching providers:', providersError)
          console.error('[Sitemap] Error details:', {
            message: providersError.message,
            code: providersError.code,
            details: providersError.details,
            hint: providersError.hint,
          })
          throw providersError // Lancer l'erreur pour qu'elle soit attrapée par le catch
        }
        
        if (providers && providers.length > 0) {
          console.log(`[Sitemap] Fetched ${providers.length} providers (offset: ${providersPageOffset})`)
          allProviders = allProviders.concat(providers)
          
          if (providers.length < providersPageLimit) {
            console.log(`[Sitemap] Last page of providers reached (got ${providers.length} < ${providersPageLimit})`)
            break
          }
          
          providersPageOffset += providersPageLimit
          providersPageCount++
        } else {
          console.log(`[Sitemap] No providers returned (offset: ${providersPageOffset})`)
          break
        }
      }

      if (allProviders.length > 0) {
        console.log(`[Sitemap] Successfully fetched ${allProviders.length} providers to include in sitemap`)
        allProviders.forEach((provider) => {
          if (provider.slug) {
            sitemapEntries.push({
              url: `${baseUrl}/annuaire/prestataire/${provider.slug}`,
              lastModified: provider.updated_at ? new Date(provider.updated_at) : new Date(provider.created_at),
              changeFrequency: 'monthly',
              priority: 0.7,
            })
          }
        })
        console.log(`[Sitemap] Added ${allProviders.length} provider URLs to sitemap`)
      } else {
        console.warn('[Sitemap] No providers found - this may indicate an RLS issue or empty database')
      }
    } catch (providerError: any) {
      console.error('[Sitemap] CRITICAL ERROR fetching providers:', providerError)
      console.error('[Sitemap] Provider error details:', {
        message: providerError?.message,
        code: providerError?.code,
        stack: providerError?.stack,
      })
      // Ne pas bloquer le reste du sitemap, mais loguer l'erreur
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

