import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Récupérer l'abonnement complet
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        // Déterminer le type d'abonnement depuis les metadata
        const subscriptionType = session.metadata?.type === 'boost' ? 'boost' : 'listing'
        
        // Récupérer le nombre maximum de fiches boostées depuis les metadata
        const maxListings = session.metadata?.maxListings 
          ? parseInt(session.metadata.maxListings, 10) 
          : null

        // Mettre à jour ou créer l'abonnement dans la base de données
        // Utiliser onConflict sur (user_id, subscription_type) pour permettre plusieurs abonnements
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: subscription.items.data[0]?.price.id,
            status: subscription.status,
            subscription_type: subscriptionType,
            max_boosted_listings: maxListings, // Stocker le nombre maximum de fiches boostées
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, {
            onConflict: 'user_id,subscription_type',
          })

        console.log('Subscription created/updated:', subscriptionId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Récupérer l'utilisateur et le type d'abonnement depuis le customer_id
        const { data: subscriptionData } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, subscription_type')
          .eq('stripe_customer_id', customerId)
          .eq('subscription_type', 'boost') // Filtrer par type boost
          .single()

        if (!subscriptionData) {
          console.error('Subscription not found for customer:', customerId)
          break
        }

        const now = new Date()
        const periodEnd = new Date(subscription.current_period_end * 1000)
        const isExpired = periodEnd < now

        // Mettre à jour l'abonnement
        await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq('user_id', subscriptionData.user_id)
          .eq('subscription_type', 'boost')

        // Si l'abonnement est expiré ou annulé, désactiver les fiches boostées
        // Ne désactiver que si la période est vraiment terminée (pas seulement si cancel_at_period_end est true)
        if (isExpired || subscription.status === 'canceled') {
          await supabaseAdmin
            .from('providers')
            .update({ is_boosted: false })
            .eq('user_id', subscriptionData.user_id)
            .eq('is_boosted', true)

          console.log('Boosted listings disabled for expired/canceled subscription:', subscription.id)
        }

        console.log('Subscription updated:', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Récupérer l'utilisateur depuis le subscription_id
        const { data: subscriptionData } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, subscription_type')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (!subscriptionData) {
          console.error('Subscription not found for deletion:', subscription.id)
          break
        }

        // Marquer l'abonnement comme annulé
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        // Si c'est un abonnement boost, désactiver toutes les fiches boostées de l'utilisateur
        if (subscriptionData.subscription_type === 'boost') {
          await supabaseAdmin
            .from('providers')
            .update({ is_boosted: false })
            .eq('user_id', subscriptionData.user_id)
            .eq('is_boosted', true)

          console.log('Boosted listings disabled for user:', subscriptionData.user_id)
        }

        console.log('Subscription canceled:', subscription.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}

