import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function ensureSuperAdmin(request: NextRequest) {
  if (!serviceRoleKey) return { error: 'Configuration serveur manquante', status: 500 as const }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return { error: 'Non autorisé', status: 401 as const }
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return { error: 'Non autorisé', status: 401 as const }
  const { data: adminRow } = await supabaseAdmin
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()
  const isSuperAdmin = adminRow?.role === 'super_admin' ||
    user.user_metadata?.role === 'super_admin' ||
    user.user_metadata?.is_super_admin === true
  if (!isSuperAdmin) return { error: 'Réservé aux super administrateurs', status: 403 as const }
  return { supabaseAdmin }
}

export async function GET(request: NextRequest) {
  try {
    const check = await ensureSuperAdmin(request)
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }
    const { supabaseAdmin } = check

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (!slug) {
      return NextResponse.json({ error: 'Paramètre slug manquant' }, { status: 400 })
    }

    const { data: provider, error } = await supabaseAdmin
      .from('providers')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !provider) {
      return NextResponse.json(
        { error: error?.message || 'Fiche non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ provider })
  } catch (err: any) {
    console.error('Error in provider-by-slug:', err)
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
