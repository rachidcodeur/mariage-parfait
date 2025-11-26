import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Route pour désactiver automatiquement les fiches boostées dont l'abonnement a expiré
 * Cette route peut être appelée par un cron job ou un webhook
 */
export async function POST(request: NextRequest) {
  try {
    const now = new Date().toISOString()

    // Récupérer tous les abonnements boost expirés ou annulés
    const { data: expiredSubscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, current_period_end, status, cancel_at_period_end')
      .eq('subscription_type', 'boost')
      .or(`status.eq.canceled,current_period_end.lt.${now}`)

    if (subError) {
      console.error('Error fetching expired subscriptions:', subError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des abonnements expirés' },
        { status: 500 }
      )
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun abonnement expiré à traiter',
        disabledCount: 0,
      })
    }

    let disabledCount = 0
    const userIds = expiredSubscriptions
      .filter(sub => {
        // Vérifier si l'abonnement est vraiment expiré
        if (sub.status === 'canceled') return true
        if (sub.current_period_end && new Date(sub.current_period_end) < new Date(now)) {
          return true
        }
        return false
      })
      .map(sub => sub.user_id)

    // Désactiver toutes les fiches boostées de ces utilisateurs
    if (userIds.length > 0) {
      const { data: updatedProviders, error: updateError } = await supabaseAdmin
        .from('providers')
        .update({ is_boosted: false })
        .in('user_id', userIds)
        .eq('is_boosted', true)
        .select('id')

      if (updateError) {
        console.error('Error disabling boosted listings:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la désactivation des fiches boostées' },
          { status: 500 }
        )
      }

      disabledCount = updatedProviders?.length || 0
    }

    return NextResponse.json({
      success: true,
      message: `${disabledCount} fiche(s) boostée(s) désactivée(s)`,
      disabledCount,
      processedUsers: userIds.length,
    })
  } catch (error: any) {
    console.error('Error in disable-expired-boosts route:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement: ' + error.message },
      { status: 500 }
    )
  }
}

