import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'abonnement' },
        { status: 500 }
      )
    }

    // Vérifier si l'abonnement est actif
    const isActive = subscription && 
      subscription.status === 'active' &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date()) &&
      !subscription.cancel_at_period_end

    return NextResponse.json({
      subscription: subscription || null,
      isActive: isActive || false,
    })
  } catch (error: any) {
    console.error('Error in get subscription route:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue: ' + error.message },
      { status: 500 }
    )
  }
}

