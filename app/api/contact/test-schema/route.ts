import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Essayer de récupérer la structure de la table
    const { data, error } = await supabase
      .from('mariage_parfait_contact_submissions')
      .select('*')
      .limit(0) // Juste pour obtenir les colonnes
    
    if (error) {
      return NextResponse.json({ 
        error: error.message,
        hint: 'Vérifiez les noms de colonnes dans Supabase'
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Table accessible',
      note: 'Vérifiez dans Supabase les noms exacts des colonnes de la table mariage_parfait_contact_submissions'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

