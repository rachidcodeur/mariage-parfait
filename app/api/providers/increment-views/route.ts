import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { providerId } = await request.json()

    console.log('[increment-views] Received request for providerId:', providerId)

    if (!providerId) {
      console.error('[increment-views] Missing providerId')
      return NextResponse.json(
        { error: 'ID du prestataire manquant' },
        { status: 400 }
      )
    }

    // Essayer d'abord avec la fonction RPC si elle existe
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('increment_provider_views', {
      provider_id: providerId,
    })

    if (!rpcError && rpcData !== null) {
      console.log('[increment-views] Success with RPC, new views:', rpcData)
      return NextResponse.json({ success: true, views: rpcData })
    }

    // Si la fonction RPC n'existe pas ou échoue, utiliser une mise à jour directe
    console.log('[increment-views] RPC not available or failed, using direct update. Error:', rpcError?.message)

    // Récupérer la valeur actuelle et incrémenter
    const { data: provider, error: fetchError } = await supabaseAdmin
      .from('providers')
      .select('views')
      .eq('id', providerId)
      .single()

    if (fetchError) {
      console.error('[increment-views] Error fetching provider:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du prestataire', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!provider) {
      console.error('[increment-views] Provider not found:', providerId)
      return NextResponse.json(
        { error: 'Prestataire non trouvé' },
        { status: 404 }
      )
    }

    const currentViews = provider.views || 0
    const newViews = currentViews + 1

    console.log('[increment-views] Updating views from', currentViews, 'to', newViews)

    const { data: updatedProvider, error: updateError } = await supabaseAdmin
      .from('providers')
      .update({ views: newViews })
      .eq('id', providerId)
      .select('views')
      .single()

    if (updateError) {
      console.error('[increment-views] Error updating views:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des vues', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('[increment-views] Success! New views:', updatedProvider.views)
    return NextResponse.json({ success: true, views: updatedProvider.views })
  } catch (error: any) {
    console.error('[increment-views] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'incrémentation des vues: ' + error.message },
      { status: 500 }
    )
  }
}

