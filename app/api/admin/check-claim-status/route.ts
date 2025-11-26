import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { providerId } = await request.json()

    if (!providerId) {
      return NextResponse.json(
        { error: 'ID de fiche manquant' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Créer un client admin avec le service role key pour contourner les RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Récupérer la fiche pour vérifier si elle a déjà un user_id
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('providers')
      .select('id, user_id')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Fiche non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier s'il existe des revendications en attente pour cette fiche
    const { data: pendingClaims, error: claimsError } = await supabaseAdmin
      .from('provider_claims')
      .select('id, user_id, status')
      .eq('provider_id', providerId)
      .eq('status', 'pending')

    if (claimsError) {
      console.error('Error checking claims:', claimsError)
      // Ne pas échouer, retourner juste les infos de la fiche
    }

    return NextResponse.json({
      provider: {
        id: provider.id,
        user_id: provider.user_id,
      },
      pendingClaims: pendingClaims || [],
    })
  } catch (error: any) {
    console.error('Error in check claim status route:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue: ' + error.message },
      { status: 500 }
    )
  }
}

