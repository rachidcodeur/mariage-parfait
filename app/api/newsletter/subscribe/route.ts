import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Créer un client Supabase avec la clé de service pour contourner RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseServiceKey || supabaseServiceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found, using anon key (may have RLS issues)')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source } = body

    // Validation de l'email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'L\'email est requis' },
        { status: 400 }
      )
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Vérifier si l'email est déjà abonné
    const { data: existing } = await supabase
      .from('mariage_parfait_newsletter_subscriptions')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      // Si déjà abonné et actif, retourner un message
      if (existing.status === 'active' || existing.status === 'subscribed') {
        return NextResponse.json({
          success: true,
          message: 'Vous êtes déjà abonné à notre newsletter !',
          alreadySubscribed: true
        })
      }
      
      // Si désabonné, réactiver l'abonnement
      const { data: updated, error: updateError } = await supabase
        .from('mariage_parfait_newsletter_subscriptions')
        .update({
          status: 'active',
          subscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: source || 'website'
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating newsletter subscription:', updateError)
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Votre abonnement a été réactivé avec succès !',
        data: updated
      })
    }

    // Créer un nouvel abonnement
    const { data, error } = await supabase
      .from('mariage_parfait_newsletter_subscriptions')
      .insert([
        {
          email: email.toLowerCase().trim(),
          source: source || 'website',
          subscribed_at: new Date().toISOString(),
          status: 'active',
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting newsletter subscription:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`
        : 'Une erreur est survenue lors de l\'abonnement. Veuillez réessayer.'
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Merci pour votre abonnement ! Vous recevrez bientôt nos meilleurs conseils.'
    })
  } catch (error: any) {
    console.error('Unexpected error in newsletter subscribe:', error)
    console.error('Error stack:', error.stack)
    
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Erreur: ${error.message || 'Erreur inconnue'}`
      : 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

