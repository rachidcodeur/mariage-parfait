import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { generatePhoneVariants } from '@/lib/phone-utils'

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

export async function POST(request: NextRequest) {
  try {
    const check = await ensureSuperAdmin(request)
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }
    const { supabaseAdmin } = check

    const body = await request.json()
    const { email, phone } = body || {}

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Indiquez un email ou un numéro de téléphone' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('providers')
      .select('id, name, slug, email, phone, city, category_id, status, created_at')
      .not('slug', 'is', null)
      .order('name', { ascending: true })

    if (email && typeof email === 'string' && email.trim()) {
      const term = email.trim().toLowerCase()
      query = query.ilike('email', `%${term}%`)
    }

    if (phone && typeof phone === 'string' && phone.trim()) {
      const variants = generatePhoneVariants(phone.trim())
      if (variants.length > 0) {
        const orConditions = variants.map((v) => `phone.ilike.%${v}%`).join(',')
        query = query.or(orConditions)
      }
    }

    // Si les deux sont fournis, on fait une requête par critère puis on fusionne par id
    if (email && phone && typeof email === 'string' && email.trim() && typeof phone === 'string' && phone.trim()) {
      const [byEmail, byPhone] = await Promise.all([
        supabaseAdmin
          .from('providers')
          .select('id, name, slug, email, phone, city, category_id, status, created_at')
          .not('slug', 'is', null)
          .ilike('email', `%${email.trim().toLowerCase()}%`),
        (() => {
          const variants = generatePhoneVariants(phone.trim())
          if (variants.length === 0)
            return Promise.resolve({ data: [] as any[] })
          return supabaseAdmin
            .from('providers')
            .select('id, name, slug, email, phone, city, category_id, status, created_at')
            .not('slug', 'is', null)
            .or(variants.map((v) => `phone.ilike.%${v}%`).join(','))
        })(),
      ])
      const ids = new Set<number>()
      const list: any[] = []
      for (const row of [...(byEmail.data || []), ...(byPhone.data || [])]) {
        if (!ids.has(row.id)) {
          ids.add(row.id)
          list.push(row)
        }
      }
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      return NextResponse.json({ providers: list })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error searching providers:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la recherche: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ providers: data || [] })
  } catch (err: any) {
    console.error('Error in search-provider:', err)
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
