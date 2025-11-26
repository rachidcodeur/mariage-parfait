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

    console.log('[increment-phone-clicks] Received request for providerId:', providerId)

    if (!providerId) {
      console.error('[increment-phone-clicks] Missing providerId')
      return NextResponse.json(
        { error: 'ID du prestataire manquant' },
        { status: 400 }
      )
    }

    // Essayer d'abord avec la fonction RPC si elle existe
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('increment_provider_phone_clicks', {
      provider_id: providerId,
    })

    if (!rpcError && rpcData !== null) {
      console.log('[increment-phone-clicks] Success with RPC, new phone_clicks:', rpcData)
      return NextResponse.json({ success: true, phone_clicks: rpcData })
    }

    // Si la fonction RPC n'existe pas ou échoue, utiliser une mise à jour directe
    console.log('[increment-phone-clicks] RPC not available or failed, using direct update. Error:', rpcError?.message)

    // Récupérer la valeur actuelle et incrémenter
    const { data: provider, error: fetchError } = await supabaseAdmin
      .from('providers')
      .select('phone_clicks')
      .eq('id', providerId)
      .single()

    if (fetchError) {
      console.error('[increment-phone-clicks] Error fetching provider:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du prestataire', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!provider) {
      console.error('[increment-phone-clicks] Provider not found:', providerId)
      return NextResponse.json(
        { error: 'Prestataire non trouvé' },
        { status: 404 }
      )
    }

    const currentClicks = provider.phone_clicks || 0
    const newClicks = currentClicks + 1

    console.log('[increment-phone-clicks] Updating phone_clicks from', currentClicks, 'to', newClicks)

    const { data: updatedProvider, error: updateError } = await supabaseAdmin
      .from('providers')
      .update({ phone_clicks: newClicks })
      .eq('id', providerId)
      .select('phone_clicks')
      .single()

    if (updateError) {
      console.error('[increment-phone-clicks] Error updating phone_clicks:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des clics téléphone', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('[increment-phone-clicks] Success! New phone_clicks:', updatedProvider.phone_clicks)
    return NextResponse.json({ success: true, phone_clicks: updatedProvider.phone_clicks })
  } catch (error: any) {
    console.error('[increment-phone-clicks] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'incrémentation des clics téléphone: ' + error.message },
      { status: 500 }
    )
  }
}

