// Script pour générer des articles en batch
// Usage: npx tsx scripts/generate-batch-articles.ts

import { createClient } from '@supabase/supabase-js'
import { generateEnrichedArticle } from '../lib/enriched-article-generator'
import { categorySlugToId } from '../lib/categories'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: Variables d\'environnement Supabase manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies')
  process.exit(1)
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

interface Result {
  date: string
  category: string
  success: boolean
  article?: any
  error?: string
  skipped?: boolean
}

async function generateBatchArticles(startDate: Date, endDate: Date, force: boolean = false) {
  const results: Result[] = []
  let totalCreated = 0
  let totalSkipped = 0
  let totalErrors = 0

  // Normaliser les dates
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  const currentDate = new Date(startDate)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalArticles = totalDays * allCategories.length

  console.log(`🚀 Démarrage de la génération de ${totalArticles} articles`)
  console.log(`📅 Période: ${startDate.toISOString().split('T')[0]} au ${endDate.toISOString().split('T')[0]}`)
  console.log(`📊 ${totalDays} jours × ${allCategories.length} catégories = ${totalArticles} articles\n`)

  let processed = 0

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dateStart = new Date(currentDate)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(currentDate)
    dateEnd.setHours(23, 59, 59, 999)

    for (const category of allCategories) {
      try {
        processed++
        const categoryId = categorySlugToId[category]
        const progress = ((processed / totalArticles) * 100).toFixed(1)

        process.stdout.write(`\r⏳ Progression: ${progress}% (${processed}/${totalArticles}) - ${dateStr} / ${category}`)

        // Vérifier si un article existe déjà
        if (!force) {
          const { data: existingArticles, error: checkError } = await supabase
            .from('articles')
            .select('id')
            .eq('category_id', categoryId)
            .gte('created_at', dateStart.toISOString())
            .lt('created_at', dateEnd.toISOString())
            .limit(1)

          if (checkError) {
            console.error(`\n❌ Erreur lors de la vérification pour ${category} le ${dateStr}:`, checkError)
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

        // Générer l'article
        const articleData = await generateEnrichedArticle(category, true, currentDate)

        // Vérifier l'unicité du slug
        const { data: existingSlug } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', articleData.slug)
          .single()

        if (existingSlug) {
          articleData.slug = `${articleData.slug}-${currentDate.getTime()}`
        }

        // Préparer l'article avec la date spécifique
        const articleWithDate = {
          ...articleData,
          created_at: currentDate.toISOString()
        }

        // Insérer l'article
        const { data, error } = await supabase
          .from('articles')
          .insert([articleWithDate])
          .select()
          .single()

        if (error) {
          console.error(`\n❌ Erreur lors de la création pour ${category} le ${dateStr}:`, error.message)
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
        console.error(`\n❌ Erreur inattendue pour ${category} le ${dateStr}:`, error.message)
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

  console.log('\n\n✅ Génération terminée!')
  console.log(`📊 Résumé:`)
  console.log(`   - Articles créés: ${totalCreated}`)
  console.log(`   - Articles ignorés (déjà existants): ${totalSkipped}`)
  console.log(`   - Erreurs: ${totalErrors}`)
  console.log(`   - Total traité: ${totalCreated + totalSkipped + totalErrors}`)

  return {
    summary: {
      totalCreated,
      totalSkipped,
      totalErrors,
      totalProcessed: totalCreated + totalSkipped + totalErrors
    },
    results
  }
}

// Exécution du script
async function main() {
  const startDate = new Date('2024-11-02')
  const endDate = new Date('2024-11-26')
  const force = process.argv.includes('--force')

  if (force) {
    console.log('⚠️  Mode FORCE activé: les articles existants seront remplacés\n')
  }

  try {
    const result = await generateBatchArticles(startDate, endDate, force)
    
    if (result.summary.totalErrors > 0) {
      console.log('\n⚠️  Certains articles n\'ont pas pu être créés. Vérifiez les erreurs ci-dessus.')
      process.exit(1)
    } else {
      console.log('\n🎉 Tous les articles ont été générés avec succès!')
      process.exit(0)
    }
  } catch (error: any) {
    console.error('\n❌ Erreur fatale:', error.message)
    process.exit(1)
  }
}

main()

