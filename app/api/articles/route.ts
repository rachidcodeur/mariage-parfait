import { NextRequest, NextResponse } from 'next/server'
import { getArticles, getArticlesCount } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const searchQuery = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    const [articles, total] = await Promise.all([
      getArticles(category, limit, offset, searchQuery),
      getArticlesCount(category, searchQuery),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

