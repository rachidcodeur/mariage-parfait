import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { userId, priceId, maxListings } = await request.json()

    if (!userId || !priceId || !maxListings) {
      return NextResponse.json(
        { error: 'ID utilisateur, prix ou nombre maximum de fiches manquant' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Récupérer ou créer le customer Stripe
    let customerId: string

    const { data: existingSubscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (subError || !existingSubscription?.stripe_customer_id) {
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (userError || !user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
        },
      })

      customerId = customer.id

      // Ne pas créer d'entrée ici, le webhook le fera
    } else {
      customerId = existingSubscription.stripe_customer_id
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/dashboard/mise-en-avant?success=true`,
      cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/dashboard/mise-en-avant?canceled=true`,
      metadata: {
        userId: userId,
        type: 'boost', // Indiquer que c'est un abonnement boost
        maxListings: String(maxListings), // Stocker le nombre maximum de fiches boostées
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating boost checkout session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement: ' + error.message },
      { status: 500 }
    )
  }
}

