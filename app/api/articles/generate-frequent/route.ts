import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateEnrichedArticle } from '@/lib/enriched-article-generator'
import { categorySlugToId } from '@/lib/categories'

// Créer un client Supabase avec la clé de service pour contourner RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseServiceKey || supabaseServiceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found, using anon key (may have RLS issues)')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const allCategories = [
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

// Route pour générer un article pour chaque catégorie (fréquence élevée)
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via header (pour sécuriser l'endpoint)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || ''
    
    // Si CRON_SECRET est défini, vérifier l'authentification
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: Array<{ category: string; success: boolean; article?: any; error?: string }> = []

    // Note: Generating for ALL categories sequentially might timeout on Vercel (10s limit on free tier).
    // If this happens, we might need to split this into multiple cron jobs or use a queue.
    for (const category of allCategories) {
      try {
        // Générer le nouvel article enrichi
        // We pass 'true' for isDaily to use the variation logic, even if it's not strictly "daily" anymore
        const articleData = await generateEnrichedArticle(category, true)

        // Vérifier l'unicité du slug
        const { data: existingSlug } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', articleData.slug)
          .single()

        if (existingSlug) {
          // Ajouter un timestamp au slug pour le rendre unique
          articleData.slug = `${articleData.slug}-${Date.now()}`
        }

        // Insérer l'article dans Supabase
        const { data, error } = await supabase
          .from('articles')
          .insert([articleData])
          .select()
          .single()

        if (error) {
          console.error(`Error creating article for ${category}:`, error)
          results.push({
            category,
            success: false,
            error: error.message
          })
        } else {
          results.push({
            category,
            success: true,
            article: data
          })
        }
      } catch (error: any) {
        console.error(`Error processing category ${category}:`, error)
        results.push({
          category,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({ 
      message: `Frequent article generation: ${successCount} created, ${failureCount} failures`,
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error', details: error.message }, { status: 500 })
  }
}

// GET pour tester
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route n\'est pas disponible en production' },
      { status: 403 }
    )
  }

  return NextResponse.json({ 
    message: 'Use POST to generate articles for all categories immediately',
    categories: allCategories
  })
}
