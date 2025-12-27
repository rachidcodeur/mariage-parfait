import { NextResponse } from 'next/server'
import { regionsData } from '@/lib/regions'
import { getArticles, supabase } from '@/lib/supabase'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

export const dynamic = 'force-dynamic'

function generateSitemapXML(urls: Array<{ url: string; lastmod?: Date; changefreq?: string; priority?: number }>): string {
  const urlsXML = urls.map(({ url, lastmod, changefreq, priority }) => {
    const lastmodStr = lastmod ? lastmod.toISOString() : new Date().toISOString()
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmodStr}</lastmod>
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`
}

export async function GET() {
  const sitemapEntries: Array<{ url: string; lastmod?: Date; changefreq?: string; priority?: number }> = []

  // Pages statiques
  sitemapEntries.push(
    { url: baseUrl, lastmod: new Date(), changefreq: 'daily', priority: 1.0 },
    { url: `${baseUrl}/blog`, lastmod: new Date(), changefreq: 'daily', priority: 0.9 },
    { url: `${baseUrl}/annuaire`, lastmod: new Date(), changefreq: 'daily', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastmod: new Date(), changefreq: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastmod: new Date(), changefreq: 'monthly', priority: 0.6 },
  )

  try {
    // Récupérer tous les articles
    console.log('[Sitemap API] Fetching articles...')
    let allArticles: any[] = []
    let articlesOffset = 0
    const articlesLimit = 1000

    while (true) {
      const articles = await getArticles('all', articlesLimit, articlesOffset)
      if (!articles || articles.length === 0) {
        break
      }
      console.log(`[Sitemap API] Fetched ${articles.length} articles (offset: ${articlesOffset})`)
      allArticles = allArticles.concat(articles)
      if (articles.length < articlesLimit) {
        break
      }
      articlesOffset += articlesLimit
    }

    if (allArticles.length > 0) {
      console.log(`[Sitemap API] Found ${allArticles.length} articles`)
      allArticles.forEach((article) => {
        sitemapEntries.push({
          url: `${baseUrl}/blog/${article.slug}`,
          lastmod: article.updated_at ? new Date(article.updated_at) : new Date(article.created_at),
          changefreq: 'weekly',
          priority: 0.8,
        })
      })
    }

    // Récupérer tous les prestataires
    console.log('[Sitemap API] Fetching providers...')
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
        console.error('[Sitemap API] Error fetching providers:', providersError)
        break
      } else if (providers && providers.length > 0) {
        console.log(`[Sitemap API] Fetched ${providers.length} providers (offset: ${providersOffset})`)
        allProviders = allProviders.concat(providers)
        if (providers.length < providersLimit) {
          break
        }
        providersOffset += providersLimit
      } else {
        break
      }
    }

    if (allProviders.length > 0) {
      console.log(`[Sitemap API] Found ${allProviders.length} providers`)
      allProviders.forEach((provider) => {
        sitemapEntries.push({
          url: `${baseUrl}/annuaire/prestataire/${provider.slug}`,
          lastmod: provider.updated_at ? new Date(provider.updated_at) : new Date(provider.created_at),
          changefreq: 'monthly',
          priority: 0.7,
        })
      })
    }

    // Catégories de blog
    const categories = [
      'robes-mariee', 'beaute', 'budget', 'ceremonie-reception', 'decoration',
      'gastronomie', 'inspiration', 'papeterie-details', 'photo-video',
      'prestataires', 'tendances', 'voyage-noces',
    ]

    categories.forEach((category) => {
      sitemapEntries.push({
        url: `${baseUrl}/blog?category=${category}`,
        lastmod: new Date(),
        changefreq: 'daily',
        priority: 0.8,
      })
    })

    // Régions et départements
    Object.keys(regionsData).forEach((regionSlug) => {
      sitemapEntries.push({
        url: `${baseUrl}/annuaire/${regionSlug}`,
        lastmod: new Date(),
        changefreq: 'weekly',
        priority: 0.8,
      })

      const region = regionsData[regionSlug]
      if (region && region.departments) {
        region.departments.forEach((department) => {
          sitemapEntries.push({
            url: `${baseUrl}/annuaire/${regionSlug}/${department.code}`,
            lastmod: new Date(),
            changefreq: 'weekly',
            priority: 0.7,
          })
        })
      }
    })

    console.log(`[Sitemap API] Generated sitemap with ${sitemapEntries.length} entries`)

    const xml = generateSitemapXML(sitemapEntries)
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: any) {
    console.error('[Sitemap API] Error:', error)
    // Retourner au moins les pages statiques en cas d'erreur
    const xml = generateSitemapXML(sitemapEntries)
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

