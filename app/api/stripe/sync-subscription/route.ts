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
    const { userId, subscriptionType } = await request.json()

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

    // Type d'abonnement à synchroniser si précisé ('listing' ou 'boost')
    const preferredType: 'listing' | 'boost' | null =
      subscriptionType === 'listing'
        ? 'listing'
        : subscriptionType === 'boost'
        ? 'boost'
        : null

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

    // Récupérer le customer_id depuis un abonnement existant
    let customerId: string | null = null
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // Si un type est demandé, privilégier ce type
      const fromPreferred =
        preferredType &&
        existingSubscriptions.find((sub: any) => sub.subscription_type === preferredType)

      const sourceSub = (fromPreferred || existingSubscriptions[0]) as any
      customerId = sourceSub.stripe_customer_id || null
    }

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
    let subscriptions
    try {
      subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all', // Récupérer tous les statuts
        limit: 10,
      })
    } catch (stripeError: any) {
      // Cas fréquent : customer créé en mode test, mais clé live utilisée
      if (stripeError?.code === 'resource_missing' || stripeError?.message?.includes('No such customer')) {
        console.error('[Sync] Customer Stripe introuvable (probablement créé en mode test) :', customerId)

        // Option safe : marquer les abonnements comme annulés côté Supabase pour ce user
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('user_id', userId)

        // On retourne un succès "soft" pour que le front n'affiche pas une erreur bloquante
        return NextResponse.json(
          {
            success: true,
            subscription: null,
            message:
              'Ancien customer Stripe introuvable (probablement en mode test). ' +
              'Les abonnements ont été marqués comme annulés côté base. ' +
              'Si besoin, demandez à l’utilisateur de se réabonner en mode production.',
          },
          { status: 200 },
        )
      }

      console.error('[Sync] Erreur Stripe lors de la récupération des abonnements:', stripeError)
      return NextResponse.json(
        { error: 'Erreur Stripe lors de la récupération des abonnements: ' + stripeError.message },
        { status: 500 },
      )
    }

    console.log(`[Sync] Trouvé ${subscriptions.data.length} abonnement(s) dans Stripe pour le customer ${customerId}`)

    if (subscriptions.data.length === 0) {
      // Pas d'abonnement dans Stripe, mettre à jour le statut dans Supabase
      const typeToMarkCanceled: 'listing' | 'boost' = preferredType || 'boost'
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('user_id', userId)
        .eq('subscription_type', typeToMarkCanceled)

      if (updateError) {
        console.error('Error updating subscription status:', updateError)
      }

      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'Aucun abonnement actif trouvé dans Stripe',
      })
    }

    // Choisir l'abonnement Stripe à synchroniser en fonction du type souhaité
    let latestSubscription = subscriptions.data[0]

    if (preferredType === 'boost') {
      // Chercher un abonnement marqué comme boost
      const boostSub = subscriptions.data.find(sub => {
        return sub.metadata?.type === 'boost' || sub.metadata?.maxListings
      })

      if (boostSub) {
        console.log('[Sync] Abonnement boost trouvé:', boostSub.id)
        latestSubscription = boostSub
      } else {
        console.log('[Sync] Aucun abonnement boost identifié, utilisation du plus récent')
      }
    } else if (preferredType === 'listing') {
      // Chercher un abonnement qui ne ressemble pas à un boost
      const listingSub = subscriptions.data.find(sub => {
        const isBoost = sub.metadata?.type === 'boost' || sub.metadata?.maxListings
        return !isBoost
      })

      if (listingSub) {
        console.log('[Sync] Abonnement listing trouvé:', listingSub.id)
        latestSubscription = listingSub
      } else {
        console.log('[Sync] Aucun abonnement listing identifié, utilisation du plus récent')
      }
    } else {
      // Comportement historique : préférer un boost si détectable
      const boostSub = subscriptions.data.find(sub => {
        return sub.metadata?.type === 'boost' || sub.metadata?.maxListings
      })

      if (boostSub) {
        console.log('[Sync] Abonnement boost trouvé:', boostSub.id)
        latestSubscription = boostSub
      } else {
        console.log('[Sync] Aucun abonnement boost identifié, utilisation du plus récent')
      }
    }

    // Récupérer le price_id de l'abonnement
    const priceId = latestSubscription.items.data[0]?.price.id || null

    // Récupérer les metadata de la session checkout pour obtenir maxListings
    // On va chercher dans les sessions récentes
    let maxListings: number | null = null
    // Par défaut, respecter le type demandé si présent, sinon partir sur "boost" comme avant
    let effectiveType: 'boost' | 'listing' = preferredType || 'boost'
    
    try {
      // Chercher d'abord dans les metadata de l'abonnement Stripe lui-même (plus fiable)
      if (latestSubscription.metadata?.maxListings) {
        maxListings = parseInt(latestSubscription.metadata.maxListings, 10)
        console.log('[Sync] maxListings trouvé dans metadata de l\'abonnement:', maxListings)
      }
      // Ne laisser les metadata définir le type que si aucun type préféré n'a été demandé
      if (!preferredType && latestSubscription.metadata?.type) {
        effectiveType = latestSubscription.metadata.type === 'boost' ? 'boost' : 'listing'
        console.log('[Sync] subscription_type trouvé dans metadata de l\'abonnement:', effectiveType)
      }
      
      // Si pas trouvé dans l'abonnement, chercher dans les sessions checkout
      if (maxListings === null || (!preferredType && effectiveType === 'boost')) {
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
            // Ne laisser les metadata définir le type que si aucun type préféré n'a été demandé
            if (!preferredType && session.metadata?.type && effectiveType === 'boost') {
              effectiveType = session.metadata.type === 'boost' ? 'boost' : 'listing'
              console.log('[Sync] subscription_type trouvé dans metadata de la session:', effectiveType)
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
      subscription_type: effectiveType, // Utiliser le type déterminé depuis les metadata
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
      subscription_type: effectiveType,
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
        .eq('subscription_type', effectiveType)
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

