import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id, subscription_type')
      .eq('user_id', userId)
      .eq('subscription_type', 'boost') // Filtrer par type boost
      .single()

    if (subError || !subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Abonnement boost non trouvé' },
        { status: 404 }
      )
    }

    // Reprendre l'abonnement dans Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    })

    // Mettre à jour dans la base de données
    await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
      })
      .eq('user_id', userId)
      .eq('subscription_type', 'boost')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error resuming subscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la reprise: ' + error.message },
      { status: 500 }
    )
  }
}

