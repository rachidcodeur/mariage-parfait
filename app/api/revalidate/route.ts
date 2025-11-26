import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Désactiver le cache pour cette route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { path, slug } = await request.json()

    if (!path && !slug) {
      return NextResponse.json(
        { error: 'Chemin ou slug manquant' },
        { status: 400 }
      )
    }

    // Revalider les chemins spécifiés
    if (path) {
      revalidatePath(path)
    }

    // Si un slug est fourni, revalider aussi la page du prestataire et les pages de département
    if (slug) {
      revalidatePath(`/annuaire/prestataire/${slug}`, 'page')
      
      // Revalider aussi les pages de département qui pourraient contenir ce prestataire
      // On revalide toutes les pages de département pour être sûr
      revalidatePath('/annuaire', 'layout')
    }

    return NextResponse.json({ 
      revalidated: true, 
      message: 'Cache revalidé avec succès',
      path: path || `/annuaire/prestataire/${slug}`,
      slug 
    })
  } catch (error: any) {
    console.error('Error revalidating cache:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la revalidation du cache: ' + error.message },
      { status: 500 }
    )
  }
}

