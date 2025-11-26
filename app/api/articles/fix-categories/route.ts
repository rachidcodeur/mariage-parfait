import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { categorySlugToId } from '@/lib/categories'

// Route pour vérifier et corriger les category_id des articles
// À appeler manuellement pour corriger les articles existants
export async function POST() {
  try {
    // Récupérer tous les articles
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('*')

    if (fetchError) {
      console.error('Error fetching articles:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No articles found', fixed: 0 })
    }

    let fixed = 0
    const updates: Array<{ id: number; oldCategoryId: number; newCategoryId: number }> = []

    // Pour chaque article, vérifier si le category_id correspond à un slug valide
    for (const article of articles) {
      // Trouver le slug correspondant au category_id actuel
      const currentSlug = Object.entries(categorySlugToId).find(
        ([_, id]) => id === article.category_id
      )?.[0]

      // Si le category_id n'existe pas dans le mapping, essayer de le corriger
      if (!currentSlug) {
        // Essayer de deviner la catégorie depuis le slug de l'article ou le titre
        // Pour l'instant, on ne peut pas vraiment deviner, donc on laisse tel quel
        // ou on met une catégorie par défaut (inspiration = 7)
        console.log(`Article ${article.id} has invalid category_id: ${article.category_id}`)
      }
    }

    return NextResponse.json({
      message: 'Articles checked',
      total: articles.length,
      fixed,
      updates,
    })
  } catch (error: any) {
    console.error('Error fixing articles:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Route GET pour afficher les statistiques
export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('category_id')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    // Compter les articles par catégorie
    const categoryCounts: Record<number, number> = {}
    articles?.forEach((article) => {
      categoryCounts[article.category_id] = (categoryCounts[article.category_id] || 0) + 1
    })

    return NextResponse.json({
      total: articles?.length || 0,
      byCategory: categoryCounts,
      validCategoryIds: Object.values(categorySlugToId),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

