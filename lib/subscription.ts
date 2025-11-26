import { getSupabaseClient } from './supabase-client'

export interface Subscription {
  id: number
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Vérifie si un utilisateur a un abonnement actif
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) {
      return false
    }

    // Vérifier si l'abonnement est actif
    const isActive = subscription.status === 'active' &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date()) &&
      !subscription.cancel_at_period_end

    return isActive
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}

/**
 * Récupère l'abonnement d'un utilisateur
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) {
      return null
    }

    return subscription as Subscription
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

