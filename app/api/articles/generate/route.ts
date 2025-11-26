import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateDailyArticle } from '@/lib/article-generator'

// Cette route peut être appelée par un cron job (Vercel Cron, GitHub Actions, etc.)
// pour générer automatiquement un article par jour
export async function POST(request: NextRequest) {
  try {
    // Vérifier si un article a déjà été créé aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: existingArticles, error: checkError } = await supabase
      .from('articles')
      .select('id')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (checkError) {
      console.error('Error checking existing articles:', checkError)
      return NextResponse.json({ error: 'Error checking articles' }, { status: 500 })
    }

    // Si un article existe déjà pour aujourd'hui, ne pas en créer un nouveau
    if (existingArticles && existingArticles.length > 0) {
      return NextResponse.json({ 
        message: 'Article already generated for today',
        article: existingArticles[0]
      })
    }

    // Générer le nouvel article
    const articleData = await generateDailyArticle()

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
      message: 'Article generated successfully',
      article: data
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error', details: error.message }, { status: 500 })
  }
}

// GET pour tester la génération - Désactivé en production
export async function GET() {
  // Désactiver cette route en production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route n\'est pas disponible en production' },
      { status: 403 }
    )
  }

  try {
    const articleData = await generateDailyArticle()
    return NextResponse.json({ 
      message: 'Article preview (not saved)',
      article: articleData
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

