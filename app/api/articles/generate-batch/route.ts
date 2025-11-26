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

// Génère tous les articles pour une période donnée
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via header (pour sécuriser l'endpoint)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || ''
    
    // Si CRON_SECRET est défini, vérifier l'authentification
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { startDate, endDate, force = false } = body

    // Dates par défaut : 2 novembre au 26 novembre 2024
    const defaultStartDate = new Date('2024-11-02')
    const defaultEndDate = new Date('2024-11-26')
    
    const start = startDate ? new Date(startDate) : defaultStartDate
    const end = endDate ? new Date(endDate) : defaultEndDate

    // Normaliser les dates (minuit UTC)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    const results: Array<{
      date: string
      category: string
      success: boolean
      article?: any
      error?: string
      skipped?: boolean
    }> = []

    // Générer les articles pour chaque jour et chaque catégorie
    const currentDate = new Date(start)
    let totalCreated = 0
    let totalSkipped = 0
    let totalErrors = 0

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dateStart = new Date(currentDate)
      dateStart.setHours(0, 0, 0, 0)
      const dateEnd = new Date(currentDate)
      dateEnd.setHours(23, 59, 59, 999)

      for (const category of allCategories) {
        try {
          const categoryId = categorySlugToId[category]

          // Vérifier si un article existe déjà pour cette date et cette catégorie (sauf si force = true)
          if (!force) {
            const { data: existingArticles, error: checkError } = await supabase
              .from('articles')
              .select('id')
              .eq('category_id', categoryId)
              .gte('created_at', dateStart.toISOString())
              .lt('created_at', dateEnd.toISOString())
              .limit(1)

            if (checkError) {
              console.error(`Error checking articles for ${category} on ${dateStr}:`, checkError)
            }

            if (existingArticles && existingArticles.length > 0) {
              results.push({
                date: dateStr,
                category,
                success: true,
                skipped: true,
                error: 'Article already exists for this date'
              })
              totalSkipped++
              continue
            }
          }

          // Générer le nouvel article enrichi avec la date spécifique
          const articleData = await generateEnrichedArticle(category, true, currentDate)

          // Vérifier l'unicité du slug
          const { data: existingSlug } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', articleData.slug)
            .single()

          if (existingSlug) {
            // Ajouter un timestamp au slug pour le rendre unique
            articleData.slug = `${articleData.slug}-${currentDate.getTime()}`
          }

          // Préparer l'article avec la date spécifique
          const articleWithDate = {
            ...articleData,
            created_at: currentDate.toISOString()
          }

          // Insérer l'article dans Supabase
          const { data, error } = await supabase
            .from('articles')
            .insert([articleWithDate])
            .select()
            .single()

          if (error) {
            console.error(`Error creating article for ${category} on ${dateStr}:`, error)
            results.push({
              date: dateStr,
              category,
              success: false,
              error: error.message
            })
            totalErrors++
          } else {
            results.push({
              date: dateStr,
              category,
              success: true,
              article: data
            })
            totalCreated++
          }
        } catch (error: any) {
          console.error(`Error processing ${category} on ${dateStr}:`, error)
          results.push({
            date: dateStr,
            category,
            success: false,
            error: error.message
          })
          totalErrors++
        }
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      message: `Batch generation completed: ${totalCreated} created, ${totalSkipped} skipped, ${totalErrors} errors`,
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      summary: {
        totalCreated,
        totalSkipped,
        totalErrors,
        totalProcessed: totalCreated + totalSkipped + totalErrors
      },
      results
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error', details: error.message }, { status: 500 })
  }
}

// GET pour afficher les informations sur la route
export async function GET() {
  // Désactiver cette route en production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route n\'est pas disponible en production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: 'Use POST to generate articles in batch',
    description: 'Génère des articles pour toutes les catégories sur une période donnée',
    defaultPeriod: {
      start: '2024-11-02',
      end: '2024-11-26'
    },
    categories: allCategories,
    example: {
      method: 'POST',
      body: {
        startDate: '2024-11-02',
        endDate: '2024-11-26',
        force: false // Si true, remplace les articles existants
      }
    },
    note: 'Les articles seront créés avec la date spécifiée dans created_at'
  })
}

