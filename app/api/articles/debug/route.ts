import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { categorySlugToId, categoryIdToSlug } from '@/lib/categories'

export const dynamic = "force-dynamic"

// Route de débogage pour vérifier les articles et catégories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'

    // Récupérer tous les articles
    const { data: allArticles, error: allError } = await supabase
      .from('articles')
      .select('id, title, category_id, slug')
      .order('created_at', { ascending: false })
      .limit(50)

    if (allError) {
      return NextResponse.json({ error: allError.message }, { status: 500 })
    }

    // Compter par catégorie
    const byCategory: Record<number, number> = {}
    allArticles?.forEach((article) => {
      byCategory[article.category_id] = (byCategory[article.category_id] || 0) + 1
    })

    // Si une catégorie spécifique est demandée
    let categoryArticles: any[] = []
    if (category !== 'all') {
      const categoryId = categorySlugToId[category]
      if (categoryId) {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('category_id', categoryId)
          .limit(10)

        if (!error) {
          categoryArticles = data || []
        }
      }
    }

    return NextResponse.json({
      totalArticles: allArticles?.length || 0,
      articlesByCategory: byCategory,
      categoryMapping: Object.entries(categorySlugToId).map(([slug, id]) => ({
        slug,
        id,
        name: categoryIdToSlug[id] ? 'OK' : 'MISSING',
        count: byCategory[id] || 0,
      })),
      requestedCategory: category,
      categoryId: category !== 'all' ? categorySlugToId[category] : null,
      sampleArticles: category !== 'all' ? categoryArticles : allArticles?.slice(0, 5),
      allCategoryIds: Object.values(categorySlugToId),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

