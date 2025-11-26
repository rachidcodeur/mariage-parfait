import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// URL de base du site (à configurer selon votre domaine de production)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  const sitemapEntries: MetadataRoute.Sitemap = []

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
        .order('created_at', { ascending: false })

      if (!articlesError && articles) {
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
      const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('slug, updated_at, created_at')
        .eq('status', 'active') // Seulement les fiches actives
        .order('created_at', { ascending: false })

      if (!providersError && providers) {
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
    } catch (error) {
      console.error('Error generating sitemap:', error)
    }
  }

  return sitemapEntries
}

