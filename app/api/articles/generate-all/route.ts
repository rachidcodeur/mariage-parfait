import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateEnrichedArticle } from '@/lib/enriched-article-generator'
import { categorySlugToId } from '@/lib/categories'

// Créer un client Supabase avec la clé de service pour contourner RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Vérifier que la clé de service est disponible
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

// Route pour générer un article pour chaque catégorie
export async function POST(request: NextRequest) {
  try {
    const results: Array<{ category: string; success: boolean; article?: any; error?: string }> = []

    for (const category of allCategories) {
      try {
        const categoryId = categorySlugToId[category]

        // Générer le nouvel article enrichi
        const articleData = await generateEnrichedArticle(category)

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
      message: `Generated articles: ${successCount} success, ${failureCount} failures`,
      results
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error', details: error.message }, { status: 500 })
  }
}

// GET pour tester (affiche les catégories disponibles)
export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to generate articles for all categories',
    categories: allCategories
  })
}

