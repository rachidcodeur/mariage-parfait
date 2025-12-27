import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results = {
    supabaseConfigured: false,
    articlesTest: {
      success: false,
      count: 0,
      error: null as any,
    },
    providersTest: {
      success: false,
      count: 0,
      error: null as any,
    },
  }

  try {
    // Test 1: Vérifier la configuration Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    results.supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

    // Test 2: Tester la récupération d'articles
    try {
      const { data: articles, error: articlesError, count } = await supabase
        .from('articles')
        .select('slug', { count: 'exact', head: false })
        .not('slug', 'is', null)
        .limit(5)

      if (articlesError) {
        results.articlesTest.error = {
          message: articlesError.message,
          code: articlesError.code,
          details: articlesError.details,
          hint: articlesError.hint,
        }
      } else {
        results.articlesTest.success = true
        results.articlesTest.count = count || articles?.length || 0
      }
    } catch (error: any) {
      results.articlesTest.error = {
        message: error.message,
        stack: error.stack,
      }
    }

    // Test 3: Tester la récupération de prestataires
    try {
      const { data: providers, error: providersError, count } = await supabase
        .from('providers')
        .select('slug', { count: 'exact', head: false })
        .not('slug', 'is', null)
        .limit(5)

      if (providersError) {
        results.providersTest.error = {
          message: providersError.message,
          code: providersError.code,
          details: providersError.details,
          hint: providersError.hint,
        }
      } else {
        results.providersTest.success = true
        results.providersTest.count = count || providers?.length || 0
      }
    } catch (error: any) {
      results.providersTest.error = {
        message: error.message,
        stack: error.stack,
      }
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      results,
    }, { status: 500 })
  }
}

