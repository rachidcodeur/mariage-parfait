import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Route pour synchroniser manuellement l'abonnement depuis Stripe
 * Utile si le webhook n'a pas été appelé (développement local, problème réseau, etc.)
 */
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

    // Récupérer l'email de l'utilisateur
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer le customer_id de l'utilisateur depuis Supabase
    // Chercher d'abord un abonnement boost, sinon n'importe quel type
    const { data: existingSubscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, subscription_type')
      .eq('user_id', userId)
      .order('subscription_type', { ascending: false }) // 'boost' avant 'listing'

    // Récupérer le customer_id depuis n'importe quel abonnement existant
    let customerId: string | null = existingSubscriptions?.[0]?.stripe_customer_id || null

    // Si pas de customer_id dans Supabase, chercher dans Stripe par email
    if (!customerId) {
      console.log('Aucun customer_id dans Supabase, recherche dans Stripe par email:', user.email)
      
      // Chercher le customer dans Stripe par email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
        console.log('Customer trouvé dans Stripe:', customerId)
        
        // Enregistrer le customer_id dans Supabase (créer un enregistrement temporaire si nécessaire)
        // On ne peut pas utiliser onConflict ici car on n'a pas de subscription_type
        // On va juste créer un enregistrement minimal pour le customer_id
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle()
        
        if (!existingSub) {
          // Créer un enregistrement minimal pour stocker le customer_id
          await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: userId,
              stripe_customer_id: customerId,
              status: 'incomplete',
              subscription_type: 'boost', // Type par défaut, sera mis à jour lors de l'upsert
            })
        } else {
          // Mettre à jour le customer_id si nécessaire
          await supabaseAdmin
            .from('subscriptions')
            .update({ stripe_customer_id: customerId })
            .eq('user_id', userId)
        }
      } else {
        // Aucun customer trouvé dans Stripe non plus
        return NextResponse.json(
          { 
            error: 'Aucun customer Stripe trouvé pour cet utilisateur. Veuillez d\'abord créer une session de paiement.',
            message: 'Vous devez d\'abord cliquer sur "S\'abonner maintenant" pour créer votre customer Stripe.'
          },
          { status: 404 }
        )
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Impossible de récupérer le customer Stripe' },
        { status: 500 }
      )
    }

    // Récupérer tous les abonnements actifs du customer depuis Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all', // Récupérer tous les statuts
      limit: 10,
    })

    console.log(`[Sync] Trouvé ${subscriptions.data.length} abonnement(s) dans Stripe pour le customer ${customerId}`)

    if (subscriptions.data.length === 0) {
      // Pas d'abonnement dans Stripe, mettre à jour le statut dans Supabase
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('user_id', userId)
        .eq('subscription_type', 'boost')

      if (updateError) {
        console.error('Error updating subscription status:', updateError)
      }

      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'Aucun abonnement actif trouvé dans Stripe',
      })
    }

    // Filtrer les abonnements boost en cherchant dans les metadata des sessions checkout
    // ou prendre le plus récent si on ne peut pas déterminer le type
    let boostSubscription = subscriptions.data.find(sub => {
      // Vérifier si l'abonnement a des metadata indiquant qu'il s'agit d'un boost
      return sub.metadata?.type === 'boost' || sub.metadata?.maxListings
    })

    // Si aucun abonnement boost trouvé, prendre le plus récent
    // (car lors de la création, on devrait avoir mis les metadata)
    if (!boostSubscription) {
      console.log('[Sync] Aucun abonnement boost identifié, utilisation du plus récent')
      boostSubscription = subscriptions.data[0]
    } else {
      console.log('[Sync] Abonnement boost trouvé:', boostSubscription.id)
    }

    const latestSubscription = boostSubscription

    // Récupérer le price_id de l'abonnement
    const priceId = latestSubscription.items.data[0]?.price.id || null

    // Récupérer les metadata de la session checkout pour obtenir maxListings
    // On va chercher dans les sessions récentes
    let maxListings: number | null = null
    let subscriptionType: 'boost' | 'listing' = 'boost' // Par défaut boost
    
    try {
      // Chercher d'abord dans les metadata de l'abonnement Stripe lui-même (plus fiable)
      if (latestSubscription.metadata?.maxListings) {
        maxListings = parseInt(latestSubscription.metadata.maxListings, 10)
        console.log('[Sync] maxListings trouvé dans metadata de l\'abonnement:', maxListings)
      }
      if (latestSubscription.metadata?.type) {
        subscriptionType = latestSubscription.metadata.type === 'boost' ? 'boost' : 'listing'
        console.log('[Sync] subscription_type trouvé dans metadata de l\'abonnement:', subscriptionType)
      }
      
      // Si pas trouvé dans l'abonnement, chercher dans les sessions checkout
      if (maxListings === null || subscriptionType === 'boost') {
        const sessions = await stripe.checkout.sessions.list({
          customer: customerId,
          limit: 20, // Augmenter la limite pour être sûr de trouver la session
          expand: ['data.subscription'],
        })
        
        console.log(`[Sync] Recherche dans ${sessions.data.length} session(s) checkout`)
        
        // Chercher la session correspondant à l'abonnement actuel
        for (const session of sessions.data) {
          const sessionSubId = typeof session.subscription === 'string' 
            ? session.subscription 
            : (session.subscription as any)?.id
          
          if (sessionSubId === latestSubscription.id) {
            console.log('[Sync] Session checkout trouvée pour l\'abonnement:', session.id)
            if (session.metadata?.maxListings && maxListings === null) {
              maxListings = parseInt(session.metadata.maxListings, 10)
              console.log('[Sync] maxListings trouvé dans metadata de la session:', maxListings)
            }
            if (session.metadata?.type && subscriptionType === 'boost') {
              subscriptionType = session.metadata.type === 'boost' ? 'boost' : 'listing'
              console.log('[Sync] subscription_type trouvé dans metadata de la session:', subscriptionType)
            }
            break
          }
        }
      }
    } catch (error) {
      console.error('[Sync] Erreur lors de la récupération des sessions checkout:', error)
    }
    
    // Si toujours pas trouvé, utiliser des valeurs par défaut
    if (maxListings === null) {
      console.log('[Sync] maxListings non trouvé, utilisation de la valeur par défaut: 0')
      maxListings = 0
    }

    // Préparer les données pour l'upsert
    const subscriptionUpdateData: any = {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: latestSubscription.id,
      stripe_price_id: priceId,
      status: latestSubscription.status,
      subscription_type: subscriptionType, // Utiliser le type déterminé depuis les metadata
      current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: latestSubscription.cancel_at_period_end || false,
    }

    // Ajouter max_boosted_listings si disponible (même si null, on peut le mettre à 0)
    subscriptionUpdateData.max_boosted_listings = maxListings !== null ? maxListings : 0

    console.log('[Sync] Tentative d\'upsert de l\'abonnement:', {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: latestSubscription.id,
      status: latestSubscription.status,
      subscription_type: subscriptionType,
      max_boosted_listings: maxListings,
      current_period_end: subscriptionUpdateData.current_period_end,
    })

    // Utiliser upsert avec onConflict pour gérer automatiquement l'insertion ou la mise à jour
    // Cela fonctionne même si l'enregistrement n'existe pas encore
    let result = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionUpdateData, {
        onConflict: 'user_id,subscription_type',
      })
      .select()
      .single()
    
    let updatedSubscription = result.data
    let updateError = result.error

    // Si l'upsert échoue à cause de la contrainte manquante, essayer une approche alternative
    if (updateError && (updateError.code === 'PGRST201' || updateError.message?.includes('unique constraint'))) {
      console.log('Upsert avec onConflict a échoué, tentative avec vérification manuelle...')
      
      // Vérifier si un abonnement de ce type existe déjà
      const { data: existingSub, error: checkError } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('subscription_type', subscriptionType)
        .maybeSingle()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing subscription:', checkError)
        return NextResponse.json(
          { 
            error: 'Erreur lors de la vérification de l\'abonnement',
            details: checkError.message,
          },
          { status: 500 }
        )
      }
      
      if (existingSub) {
        // Mise à jour
        result = await supabaseAdmin
          .from('subscriptions')
          .update(subscriptionUpdateData)
          .eq('id', existingSub.id)
          .select()
          .single()
      } else {
        // Insertion
        result = await supabaseAdmin
          .from('subscriptions')
          .insert(subscriptionUpdateData)
          .select()
          .single()
      }
      
      updatedSubscription = result.data
      updateError = result.error
    }

    if (updateError) {
      console.error('Error updating/inserting subscription:', updateError)
      console.error('Error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      })
      
      // Message d'erreur plus explicite
      let errorMessage = 'Erreur lors de la mise à jour de l\'abonnement'
      if (updateError.code === '23505') {
        errorMessage = 'Un abonnement de ce type existe déjà. Veuillez exécuter le script de migration SQL pour mettre à jour la structure de la table.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: updateError.message,
          code: updateError.code,
          hint: updateError.hint || 'Assurez-vous que la contrainte UNIQUE(user_id, subscription_type) existe dans la table subscriptions',
        },
        { status: 500 }
      )
    }

    if (!updatedSubscription) {
      console.error('[Sync] Aucune donnée retournée après l\'upsert')
      return NextResponse.json(
        { error: 'Aucune donnée retournée après la mise à jour' },
        { status: 500 }
      )
    }

    console.log('[Sync] Abonnement synchronisé avec succès:', {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      subscription_type: updatedSubscription.subscription_type,
      max_boosted_listings: updatedSubscription.max_boosted_listings,
    })

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Abonnement synchronisé avec succès',
    })
  } catch (error: any) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation: ' + error.message },
      { status: 500 }
    )
  }
}

