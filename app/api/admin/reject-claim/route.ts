import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { claimId, adminNotes } = await request.json()

    if (!claimId) {
      return NextResponse.json(
        { error: 'ID de revendication manquant' },
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

    // Récupérer l'utilisateur depuis le header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Extraire le token JWT
    const token = authHeader.replace('Bearer ', '')
    
    // Vérifier le token et obtenir l'utilisateur
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Mettre à jour la revendication avec l'API admin (contourne les RLS)
    const { data: updatedClaim, error: updateError } = await supabaseAdmin
      .from('provider_claims')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', claimId)
      .select()
      .single()

    if (updateError) {
      console.error('Error rejecting claim:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors du rejet de la revendication: ' + updateError.message },
        { status: 500 }
      )
    }

    if (!updatedClaim) {
      return NextResponse.json(
        { error: 'Revendication non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que le statut a bien été mis à jour
    if (updatedClaim.status !== 'rejected') {
      console.error('Le statut n\'a pas été mis à jour correctement:', updatedClaim)
      return NextResponse.json(
        { error: 'Le statut n\'a pas été mis à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      claim: updatedClaim 
    })
  } catch (error: any) {
    console.error('Error in reject claim route:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue: ' + error.message },
      { status: 500 }
    )
  }
}

