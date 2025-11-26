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

// Vérifier si un article a déjà été créé aujourd'hui pour une catégorie
async function hasArticleToday(categoryId: number): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .eq('category_id', categoryId)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .limit(1)

  if (error) {
    console.error(`Error checking articles for category ${categoryId}:`, error)
    return false
  }

  return (data?.length || 0) > 0
}

// Route pour générer un article quotidien pour chaque catégorie
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via header (pour sécuriser l'endpoint)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || ''
    
    // Si CRON_SECRET est défini, vérifier l'authentification
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: Array<{ category: string; success: boolean; article?: any; error?: string; skipped?: boolean }> = []

    for (const category of allCategories) {
      try {
        const categoryId = categorySlugToId[category]

        // Vérifier si un article a déjà été créé aujourd'hui
        const alreadyExists = await hasArticleToday(categoryId)
        if (alreadyExists) {
          results.push({
            category,
            success: true,
            skipped: true,
            error: 'Article already exists for today'
          })
          continue
        }

        // Générer le nouvel article enrichi avec variation quotidienne
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

    const successCount = results.filter(r => r.success && !r.skipped).length
    const skippedCount = results.filter(r => r.skipped).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({ 
      message: `Daily article generation: ${successCount} created, ${skippedCount} skipped (already exist), ${failureCount} failures`,
      date: new Date().toISOString().split('T')[0],
      results
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error', details: error.message }, { status: 500 })
  }
}

// GET pour tester (affiche les catégories disponibles) - Désactivé en production
export async function GET() {
  // Désactiver cette route en production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route n\'est pas disponible en production' },
      { status: 403 }
    )
  }

  return NextResponse.json({ 
    message: 'Use POST to generate daily articles for all categories',
    categories: allCategories,
    note: 'This endpoint checks if articles already exist for today before creating new ones'
  })
}

