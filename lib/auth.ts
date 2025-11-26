'use client'

import { getSupabaseClient } from './supabase-client'
import type { User } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  error: string | null
}

// Fonction pour traduire les erreurs Supabase en français
function translateAuthError(error: any): string {
  if (!error) return 'Une erreur est survenue'
  
  const errorMessage = (error.message || error.toString() || '').toLowerCase()
  const errorCode = error.status || error.code

  // Erreurs de connexion - les plus courantes
  if (errorMessage.includes('invalid login credentials') || 
      errorMessage.includes('invalid credentials') ||
      errorMessage.includes('email and password') ||
      errorMessage.includes('wrong password') ||
      errorMessage.includes('incorrect password') ||
      (errorCode === 400 && (errorMessage.includes('login') || errorMessage.includes('password')))) {
    return 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants et réessayer.'
  }

  // Erreurs d'email non confirmé
  if (errorMessage.includes('email not confirmed') ||
      errorMessage.includes('email_not_confirmed') ||
      errorMessage.includes('confirmation')) {
    return 'Votre email n\'a pas été confirmé. Veuillez vérifier votre boîte mail (et les spams) et cliquer sur le lien de confirmation.'
  }

  // Limite de taux dépassée
  if (errorMessage.includes('rate limit') ||
      errorMessage.includes('too many requests') ||
      errorMessage.includes('too many')) {
    return 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.'
  }

  // Utilisateur déjà enregistré
  if (errorMessage.includes('user already registered') ||
      errorMessage.includes('already registered') ||
      errorMessage.includes('email already exists') ||
      errorMessage.includes('already exists')) {
    return 'Cet email est déjà utilisé. Connectez-vous ou utilisez la réinitialisation de mot de passe si vous avez oublié votre mot de passe.'
  }

  // Erreurs de mot de passe
  if (errorMessage.includes('password')) {
    if (errorMessage.includes('too short') || errorMessage.includes('minimum')) {
      return 'Le mot de passe doit contenir au moins 6 caractères.'
    }
    if (errorMessage.includes('weak') || errorMessage.includes('strength')) {
      return 'Le mot de passe est trop faible. Utilisez un mot de passe plus fort avec des lettres, chiffres et caractères spéciaux.'
    }
    if (errorMessage.includes('required')) {
      return 'Le mot de passe est requis.'
    }
    return 'Le mot de passe ne respecte pas les critères requis. Veuillez en choisir un autre.'
  }

  // Erreurs de format d'email
  if (errorMessage.includes('invalid email') ||
      errorMessage.includes('email format') ||
      errorMessage.includes('malformed')) {
    return 'L\'adresse email n\'est pas valide. Veuillez vérifier votre saisie.'
  }

  // Erreurs réseau
  if (errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout')) {
    return 'Problème de connexion. Vérifiez votre connexion internet et réessayez.'
  }

  // Utilisateur non trouvé
  if (errorMessage.includes('user not found') ||
      errorMessage.includes('no user found')) {
    return 'Aucun compte trouvé avec cet email. Vérifiez votre adresse ou inscrivez-vous si vous n\'avez pas encore de compte.'
  }

  // Erreurs de session/token
  if (errorMessage.includes('session') ||
      errorMessage.includes('token') ||
      errorMessage.includes('expired') ||
      errorMessage.includes('invalid token')) {
    return 'Votre session a expiré. Veuillez vous reconnecter.'
  }

  // Erreurs de validation
  if (errorMessage.includes('validation') ||
      errorMessage.includes('invalid')) {
    return 'Les informations saisies ne sont pas valides. Veuillez vérifier tous les champs.'
  }

  // Erreurs de serveur
  if (errorCode >= 500 || errorMessage.includes('server') || errorMessage.includes('internal')) {
    return 'Une erreur technique est survenue. Veuillez réessayer dans quelques instants.'
  }

  // Erreur générique si aucune correspondance
  // Afficher le message original en cas de doute, mais en français si possible
  console.warn('Erreur non traduite:', errorMessage, errorCode)
  return 'Une erreur est survenue lors de la connexion. Veuillez vérifier vos identifiants et réessayer.'
}

// Inscription
export async function signUp(
  email: string,
  password: string,
  metadata?: {
    first_name?: string
    last_name?: string
    phone?: string
  }
): Promise<AuthResponse> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/espace-pro`,
        data: {
          first_name: metadata?.first_name || '',
          last_name: metadata?.last_name || '',
          phone: metadata?.phone || '',
        },
      },
    })

    if (error) {
      return { user: null, error: translateAuthError(error) }
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: translateAuthError(error) }
  }
}

// Connexion
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: translateAuthError(error) }
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: translateAuthError(error) }
  }
}

// Connexion avec lien magique
export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/espace-pro`,
      },
    })

    if (error) {
      return { error: translateAuthError(error) }
    }

    return { error: null }
  } catch (error: any) {
    return { error: translateAuthError(error) }
  }
}

// Déconnexion
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: translateAuthError(error) }
    }

    return { error: null }
  } catch (error: any) {
    return { error: translateAuthError(error) }
  }
}

// Récupérer l'utilisateur actuel
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    return null
  }
}

// Récupérer la session actuelle
export async function getSession() {
  try {
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    return null
  }
}

// Mettre à jour les métadonnées utilisateur
export async function updateUserMetadata(metadata: {
  first_name?: string
  last_name?: string
  phone?: string
}): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.updateUser({
      data: metadata,
    })

    if (error) {
      return { error: translateAuthError(error) }
    }

    return { error: null }
  } catch (error: any) {
    return { error: translateAuthError(error) }
  }
}

// Mettre à jour l'email
export async function updateEmail(newEmail: string): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      return { error: translateAuthError(error) }
    }

    return { error: null }
  } catch (error: any) {
    return { error: translateAuthError(error) }
  }
}

// Mettre à jour le mot de passe
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: translateAuthError(error) }
    }

    return { error: null }
  } catch (error: any) {
    return { error: translateAuthError(error) }
  }
}

// Supprimer le compte utilisateur
export async function deleteAccount(): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Aucun utilisateur connecté' }
    }

    const response = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Erreur lors de la suppression du compte' }
    }

    // Déconnecter l'utilisateur après suppression
    await supabase.auth.signOut()

    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Une erreur est survenue' }
  }
}

