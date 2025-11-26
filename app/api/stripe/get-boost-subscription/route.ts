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

    // Récupérer l'abonnement boost (type = 'boost')
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_type', 'boost') // Filtrer par type boost
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching boost subscription:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'abonnement' },
        { status: 500 }
      )
    }

    // Un abonnement est actif si :
    // 1. Il existe
    // 2. Son statut est 'active' ou 'trialing'
    // 3. La période n'est pas expirée (si current_period_end existe)
    // Note: Même si cancel_at_period_end est true, l'abonnement reste actif jusqu'à la fin de la période
    const now = new Date()
    const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null
    const isExpired = periodEnd ? periodEnd < now : false
    
    const isActive = subscription && 
      (subscription.status === 'active' || subscription.status === 'trialing') &&
      !isExpired

    console.log('[get-boost-subscription] Vérification:', {
      hasSubscription: !!subscription,
      status: subscription?.status,
      isExpired,
      cancel_at_period_end: subscription?.cancel_at_period_end,
      isActive,
    })

    return NextResponse.json({
      subscription: subscription || null,
      isActive: isActive || false,
      maxListings: subscription?.max_boosted_listings || 0, // Retourner le nombre maximum de fiches
    })
  } catch (error: any) {
    console.error('Error in get boost subscription route:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue: ' + error.message },
      { status: 500 }
    )
  }
}

