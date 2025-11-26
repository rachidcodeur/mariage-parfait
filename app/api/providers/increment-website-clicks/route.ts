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

    console.log('[increment-website-clicks] Received request for providerId:', providerId)

    if (!providerId) {
      console.error('[increment-website-clicks] Missing providerId')
      return NextResponse.json(
        { error: 'ID du prestataire manquant' },
        { status: 400 }
      )
    }

    // Essayer d'abord avec la fonction RPC si elle existe
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('increment_provider_website_clicks', {
      provider_id: providerId,
    })

    if (!rpcError && rpcData !== null) {
      console.log('[increment-website-clicks] Success with RPC, new website_clicks:', rpcData)
      return NextResponse.json({ success: true, website_clicks: rpcData })
    }

    // Si la fonction RPC n'existe pas ou échoue, utiliser une mise à jour directe
    console.log('[increment-website-clicks] RPC not available or failed, using direct update. Error:', rpcError?.message)

    // Récupérer la valeur actuelle et incrémenter
    const { data: provider, error: fetchError } = await supabaseAdmin
      .from('providers')
      .select('website_clicks')
      .eq('id', providerId)
      .single()

    if (fetchError) {
      console.error('[increment-website-clicks] Error fetching provider:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du prestataire', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!provider) {
      console.error('[increment-website-clicks] Provider not found:', providerId)
      return NextResponse.json(
        { error: 'Prestataire non trouvé' },
        { status: 404 }
      )
    }

    const currentClicks = provider.website_clicks || 0
    const newClicks = currentClicks + 1

    console.log('[increment-website-clicks] Updating website_clicks from', currentClicks, 'to', newClicks)

    const { data: updatedProvider, error: updateError } = await supabaseAdmin
      .from('providers')
      .update({ website_clicks: newClicks })
      .eq('id', providerId)
      .select('website_clicks')
      .single()

    if (updateError) {
      console.error('[increment-website-clicks] Error updating website_clicks:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des clics site web', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('[increment-website-clicks] Success! New website_clicks:', updatedProvider.website_clicks)
    return NextResponse.json({ success: true, website_clicks: updatedProvider.website_clicks })
  } catch (error: any) {
    console.error('[increment-website-clicks] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'incrémentation des clics site web: ' + error.message },
      { status: 500 }
    )
  }
}

