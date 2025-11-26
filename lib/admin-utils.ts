'use client'

import { getSupabaseClient } from './supabase-client'
import type { User } from '@supabase/supabase-js'

/**
 * Vérifie si un utilisateur est un administrateur
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false

  // Vérifier dans les métadonnées utilisateur
  const isAdminInMetadata = user.user_metadata?.is_admin === true || 
                            user.user_metadata?.is_admin === 'true'

  if (isAdminInMetadata) {
    return true
  }

  // Vérifier dans la table admins
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!error && data) {
      return true
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
  }

  return false
}

/**
 * Vérifie si un utilisateur est un super admin
 */
export async function isSuperAdmin(user: User | null): Promise<boolean> {
  if (!user) return false

  // Vérifier dans la table admins pour le rôle super_admin
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('admins')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!error && data && data.role === 'super_admin') {
      return true
    }
  } catch (error) {
    console.error('Error checking super admin status:', error)
  }

  // Vérifier aussi dans les métadonnées
  const isSuperAdminInMetadata = user.user_metadata?.role === 'super_admin' ||
                                 user.user_metadata?.is_super_admin === true

  return isSuperAdminInMetadata
}

/**
 * Obtient le rôle d'un utilisateur
 */
export async function getUserRole(user: User | null): Promise<'user' | 'admin' | 'super_admin'> {
  if (!user) return 'user'

  if (await isSuperAdmin(user)) {
    return 'super_admin'
  }

  if (await isAdmin(user)) {
    return 'admin'
  }

  return 'user'
}

