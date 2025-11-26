import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateEnrichedArticle } from '@/lib/enriched-article-generator'
import { categorySlugToId } from '@/lib/categories'

// Route pour générer un article pour une catégorie spécifique
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category } = body

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    if (!categorySlugToId[category]) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 })
    }

    // Vérifier si un article existe déjà pour cette catégorie aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const categoryId = categorySlugToId[category]

    const { data: existingArticles, error: checkError } = await supabase
      .from('articles')
      .select('id')
      .eq('category_id', categoryId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (checkError) {
      console.error('Error checking existing articles:', checkError)
      return NextResponse.json({ error: 'Error checking articles' }, { status: 500 })
    }

    // Si un article existe déjà pour cette catégorie aujourd'hui, ne pas en créer un nouveau
    if (existingArticles && existingArticles.length > 0) {
      return NextResponse.json({ 
        message: `Article already generated for category ${category} today`,
        article: existingArticles[0]
      })
    }

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
      console.error('Error creating article:', error)
      return NextResponse.json({ error: 'Error creating article', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Article generated successfully for category ${category}`,
      article: data
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error', details: error.message }, { status: 500 })
  }
}

// GET pour tester la génération - Désactivé en production
export async function GET(request: NextRequest) {
  // Désactiver cette route en production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route n\'est pas disponible en production' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 })
    }

    const articleData = await generateEnrichedArticle(category)
    return NextResponse.json({ 
      message: 'Article preview (not saved)',
      article: articleData
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

