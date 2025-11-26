import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email manquant' },
        { status: 400 }
      )
    }

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Créer un client admin avec le service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Récupérer l'utilisateur par email
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      )
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'abonnement de cet utilisateur
    const { error: deleteError } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting subscription:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'abonnement: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `Abonnement supprimé pour ${email}` 
    })
  } catch (error: any) {
    console.error('Error in reset subscription route:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue: ' + error.message },
      { status: 500 }
    )
  }
}

