import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const testResults = {
    success: false,
    providers: [] as any[],
    error: null as any,
    count: 0,
    details: {
      firstPage: null as any,
      queryDetails: null as any,
    },
  }

  try {
    console.log('[Sitemap Providers Test] Starting test...')
    console.log('[Sitemap Providers Test] Supabase client:', !!supabase)

    // Test exactement comme dans le sitemap
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .order('created_at', { ascending: false })
      .range(0, 999) // Première page de 1000 éléments

    if (providersError) {
      testResults.error = {
        message: providersError.message,
        code: providersError.code,
        details: providersError.details,
        hint: providersError.hint,
      }
      console.error('[Sitemap Providers Test] Error:', providersError)
    } else {
      testResults.success = true
      testResults.providers = providers || []
      testResults.count = providers?.length || 0
      testResults.details.firstPage = {
        count: providers?.length || 0,
        firstProvider: providers?.[0] || null,
        lastProvider: providers?.[providers.length - 1] || null,
      }
      console.log(`[Sitemap Providers Test] Success: Found ${testResults.count} providers`)
    }

    // Test avec count pour vérifier le total
    const { count: totalCount, error: countError } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .not('slug', 'is', null)

    if (!countError) {
      testResults.details.queryDetails = {
        totalCount,
        firstPageCount: testResults.count,
      }
    }

  } catch (error: any) {
    testResults.error = {
      message: error.message,
      stack: error.stack,
    }
    console.error('[Sitemap Providers Test] Exception:', error)
  }

  return NextResponse.json(testResults, { status: testResults.success ? 200 : 500 })
}

