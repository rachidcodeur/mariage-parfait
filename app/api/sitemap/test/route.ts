import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { regionsData } from '@/lib/regions'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  const stats = {
    staticPages: 5,
    articles: 0,
    providers: 0,
    categories: 12,
    regions: 0,
    departments: 0,
    total: 0,
    errors: [] as string[],
  }

  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    try {
      // Compter les articles
      const { count: articlesCount, error: articlesError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .not('slug', 'is', null)

      if (articlesError) {
        stats.errors.push(`Articles: ${articlesError.message}`)
      } else {
        stats.articles = articlesCount || 0
      }

      // Compter les prestataires
      const { count: providersCount, error: providersError } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .not('slug', 'is', null)

      if (providersError) {
        stats.errors.push(`Providers: ${providersError.message}`)
      } else {
        stats.providers = providersCount || 0
      }

      // Compter les régions et départements
      stats.regions = Object.keys(regionsData).length
      stats.departments = Object.values(regionsData).reduce((sum, region) => sum + region.departments.length, 0)

    } catch (error: any) {
      stats.errors.push(`General error: ${error.message}`)
    }
  } else {
    stats.errors.push('Supabase not configured')
  }

  stats.total = stats.staticPages + stats.articles + stats.providers + stats.categories + stats.regions + stats.departments

  return NextResponse.json(stats, { status: 200 })
}

