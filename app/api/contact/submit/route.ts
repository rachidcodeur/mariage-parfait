import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, request_type, subject, message } = body

    // Validation des champs requis
    if (!name || !email || !request_type || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Créer un client Supabase avec la clé de service pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante. Veuillez contacter l\'administrateur.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Insérer la soumission dans Supabase
    const { data, error } = await supabase
      .from('mariage_parfait_contact_submissions')
      .insert([
        {
          name,
          email,
          request_type,
          subject,
          message,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting contact submission:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // Message d'erreur plus détaillé pour le développement
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`
        : 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Votre message a été envoyé avec succès !'
    })
  } catch (error: any) {
    console.error('Unexpected error in contact submit:', error)
    console.error('Error stack:', error.stack)
    
    // Message d'erreur plus détaillé pour le développement
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Erreur: ${error.message || 'Erreur inconnue'}`
      : 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

