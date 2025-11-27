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

    // Récupérer l'email de l'utilisateur d'abord
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const { data: existingSubscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    // Si on a un customer_id dans la base, vérifier s'il existe dans Stripe
    if (!subError && existingSubscription?.stripe_customer_id) {
      try {
        // Vérifier si le customer existe dans Stripe
        await stripe.customers.retrieve(existingSubscription.stripe_customer_id)
        customerId = existingSubscription.stripe_customer_id
      } catch (stripeError: any) {
        // Si le customer n'existe pas (erreur 404 ou "No such customer")
        if (stripeError.code === 'resource_missing' || stripeError.message?.includes('No such customer')) {
          console.log(`Customer ${existingSubscription.stripe_customer_id} n'existe plus dans Stripe, création d'un nouveau`)
          // Le customer n'existe plus, on va en créer un nouveau
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: userId,
            },
          })
          customerId = customer.id
          
          // Mettre à jour la base de données avec le nouveau customer_id
          await supabaseAdmin
            .from('subscriptions')
            .update({ stripe_customer_id: customerId })
            .eq('user_id', userId)
        } else {
          // Autre erreur Stripe, on la propage
          throw stripeError
        }
      }
    } else {
      // Pas de customer_id dans la base, en créer un nouveau
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id
      
      // Sauvegarder le customer_id dans la base de données
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
        }, {
          onConflict: 'user_id',
        })
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

