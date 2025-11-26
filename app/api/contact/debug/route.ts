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

    // 1. Vérifier la configuration
    const config = {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey && supabaseServiceKey !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKeyLength: supabaseServiceKey?.length || 0
    }

    // 2. Tester une requête simple pour voir si la table existe
    // Utiliser rpc pour vérifier si la table existe
    let tableExists = false
    let queryError = null
    
    try {
      const { data: testQuery, error: qError } = await supabase
        .from('mariage_parfait_contact_submissions')
        .select('id')
        .limit(1)
      
      tableExists = !qError
      queryError = qError
    } catch (err: any) {
      queryError = { message: err.message, stack: err.stack }
    }

    // 3. Tester une insertion avec toutes les colonnes possibles
    const testData = {
      name: 'Debug Test',
      email: 'debug@test.com',
      request_type: 'question',
      subject: 'Debug Test',
      message: 'This is a debug test'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('mariage_parfait_contact_submissions')
      .insert([testData])
      .select()
      .single()

    // 4. Si l'insertion réussit, supprimer la donnée de test
    if (insertData?.id) {
      await supabase
        .from('mariage_parfait_contact_submissions')
        .delete()
        .eq('id', insertData.id)
    }

    return NextResponse.json({
      config,
      tableExists,
      queryError: queryError ? {
        message: queryError.message || 'Unknown error',
        details: queryError.details,
        hint: queryError.hint,
        code: queryError.code,
        ...(queryError.stack && { stack: queryError.stack })
      } : null,
      insertTest: {
        success: !insertError,
        error: insertError ? {
          message: insertError.message || 'Unknown error',
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        } : null,
        insertedData: insertData
      },
      testData,
      recommendation: !tableExists 
        ? 'La table n\'existe pas. Exécutez le script SQL: supabase/check_and_create_contact_table.sql dans Supabase'
        : insertError 
          ? 'La table existe mais l\'insertion échoue. Vérifiez les colonnes et les politiques RLS.'
          : 'Tout fonctionne correctement!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

