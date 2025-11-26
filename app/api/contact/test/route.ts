import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  // Désactiver cette route en production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route n\'est pas disponible en production' },
      { status: 403 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Tester une insertion avec des données de test
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      request_type: 'question',
      subject: 'Test Subject',
      message: 'Test message'
    }

    const { data, error } = await supabase
      .from('mariage_parfait_contact_submissions')
      .insert([testData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        testData
      }, { status: 500 })
    }

    // Supprimer la donnée de test
    if (data?.id) {
      await supabase
        .from('mariage_parfait_contact_submissions')
        .delete()
        .eq('id', data.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Test réussi ! La table est correctement configurée.',
      testData,
      insertedData: data
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

