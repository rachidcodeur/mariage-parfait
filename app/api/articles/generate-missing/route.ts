import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateEnrichedArticle } from '@/lib/enriched-article-generator'
import { categorySlugToId } from '@/lib/categories'

export const dynamic = 'force-dynamic'

// Route pour générer les articles manquants : 1 article par catégorie et par jour
// depuis la date du dernier article jusqu'à aujourd'hui
export async function POST(request: NextRequest) {
  try {
    // Récupérer la date du dernier article créé
    const { data: lastArticle, error: lastArticleError } = await supabase
      .from('articles')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lastArticleError && lastArticleError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, ce qui est OK si c'est le premier article
      console.error('Error fetching last article:', lastArticleError)
      return NextResponse.json({ 
        error: 'Error fetching last article', 
        details: lastArticleError.message 
      }, { status: 500 })
    }

    // Déterminer la date de départ
    let startDate: Date
    if (lastArticle && lastArticle.created_at) {
      // Commencer le jour suivant le dernier article
      startDate = new Date(lastArticle.created_at)
      startDate.setDate(startDate.getDate() + 1)
      startDate.setHours(0, 0, 0, 0) // Début de journée
    } else {
      // Si aucun article, commencer il y a 30 jours
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
    }

    // Date de fin : aujourd'hui à minuit
    const endDate = new Date()
    endDate.setHours(0, 0, 0, 0)

    // Vérifier qu'il y a des jours à générer
    if (startDate >= endDate) {
      return NextResponse.json({ 
        message: 'Aucun article à générer. Tous les articles sont à jour.',
        lastArticleDate: lastArticle?.created_at || null,
        today: endDate.toISOString()
      })
    }

    // Récupérer toutes les catégories
    const categories = Object.keys(categorySlugToId)
    
    // Calculer le nombre de jours
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalArticles = daysDiff * categories.length

    console.log(`[Generate Missing] Génération de ${totalArticles} articles`)
    console.log(`[Generate Missing] Période: ${startDate.toISOString()} à ${endDate.toISOString()}`)
    console.log(`[Generate Missing] ${daysDiff} jours × ${categories.length} catégories`)

    const results = {
      success: 0,
      errors: 0,
      skipped: 0,
      details: [] as Array<{ date: string; category: string; status: string; error?: string }>,
    }

    // Générer les articles jour par jour
    const currentDate = new Date(startDate)
    
    while (currentDate < endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Pour chaque catégorie
      for (const category of categories) {
        try {
          // Vérifier si un article existe déjà pour cette catégorie et cette date
          const dayStart = new Date(currentDate)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(currentDate)
          dayEnd.setHours(23, 59, 59, 999)

          const { data: existing, error: checkError } = await supabase
            .from('articles')
            .select('id')
            .eq('category_id', categorySlugToId[category])
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString())
            .limit(1)

          if (checkError) {
            console.error(`[Generate Missing] Error checking existing article for ${category} on ${dateStr}:`, checkError)
            results.errors++
            results.details.push({
              date: dateStr,
              category,
              status: 'error',
              error: checkError.message,
            })
            continue
          }

          // Si un article existe déjà, le skip
          if (existing && existing.length > 0) {
            results.skipped++
            results.details.push({
              date: dateStr,
              category,
              status: 'skipped',
            })
            continue
          }

          // Générer l'article avec la date spécifique
          const articleData = await generateEnrichedArticle(category, true, currentDate)

          // Vérifier si le slug existe déjà (au cas où)
          const { data: existingSlug, error: slugError } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', articleData.slug)
            .limit(1)

          if (slugError) {
            console.error(`[Generate Missing] Error checking slug for ${articleData.slug}:`, slugError)
            results.errors++
            results.details.push({
              date: dateStr,
              category,
              status: 'error',
              error: `Slug check error: ${slugError.message}`,
            })
            continue
          }

          // Si le slug existe, ajouter un timestamp pour le rendre unique
          if (existingSlug && existingSlug.length > 0) {
            articleData.slug = `${articleData.slug}-${currentDate.getTime()}`
          }

          // Insérer l'article avec la date spécifique
          const { data: inserted, error: insertError } = await supabase
            .from('articles')
            .insert([{
              ...articleData,
              created_at: currentDate.toISOString(),
            }])
            .select()
            .single()

          if (insertError) {
            console.error(`[Generate Missing] Error inserting article for ${category} on ${dateStr}:`, insertError)
            results.errors++
            results.details.push({
              date: dateStr,
              category,
              status: 'error',
              error: insertError.message,
            })
          } else {
            results.success++
            results.details.push({
              date: dateStr,
              category,
              status: 'created',
            })
            console.log(`[Generate Missing] ✓ Created article for ${category} on ${dateStr}`)
          }
        } catch (error: any) {
          console.error(`[Generate Missing] Exception for ${category} on ${dateStr}:`, error)
          results.errors++
          results.details.push({
            date: dateStr,
            category,
            status: 'error',
            error: error.message,
          })
        }

        // Petite pause pour éviter de surcharger Supabase
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      message: 'Génération terminée',
      summary: {
        total: totalArticles,
        success: results.success,
        errors: results.errors,
        skipped: results.skipped,
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: daysDiff,
      },
      details: results.details,
    })
  } catch (error: any) {
    console.error('[Generate Missing] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error.message 
    }, { status: 500 })
  }
}

// GET pour tester (désactivé en production)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  // Afficher les informations sans générer
  const { data: lastArticle } = await supabase
    .from('articles')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const categories = Object.keys(categorySlugToId)
  
  let startDate: Date
  if (lastArticle && lastArticle.created_at) {
    startDate = new Date(lastArticle.created_at)
    startDate.setDate(startDate.getDate() + 1)
    startDate.setHours(0, 0, 0, 0)
  } else {
    startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    startDate.setHours(0, 0, 0, 0)
  }

  const endDate = new Date()
  endDate.setHours(0, 0, 0, 0)

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalArticles = daysDiff * categories.length

  return NextResponse.json({
    info: 'Preview mode - use POST to generate articles',
    lastArticleDate: lastArticle?.created_at || null,
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days: daysDiff,
    },
    categories: categories.length,
    totalArticlesToGenerate: totalArticles,
  })
}

