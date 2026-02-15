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

export async function POST(request: NextRequest) {
  try {
    const check = await ensureSuperAdmin(request)
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }
    const { supabaseAdmin } = check

    const body = await request.json()
    const { slug, ...fields } = body

    if (!slug) {
      return NextResponse.json({ error: 'Paramètre slug manquant' }, { status: 400 })
    }

    const addressParts = [
      fields.street_number,
      fields.street_name,
      fields.postal_code,
      fields.city,
    ].filter(Boolean)
    const address = addressParts.length > 0 ? addressParts.join(', ') : null

    const updatePayload: Record<string, unknown> = {
      name: fields.name ?? undefined,
      category_id: fields.category_id != null ? parseInt(String(fields.category_id), 10) : undefined,
      summary: fields.summary ?? undefined,
      description: fields.description ?? undefined,
      email: fields.email ?? undefined,
      phone: fields.phone || null,
      website: fields.website || null,
      street_number: fields.street_number || null,
      street_name: fields.street_name || null,
      postal_code: fields.postal_code || null,
      city: fields.city || null,
      code_departement: fields.code_departement || null,
      address: address ?? undefined,
      facebook_url: fields.facebook_url || null,
      instagram_url: fields.instagram_url || null,
      linkedin_url: fields.linkedin_url || null,
      tiktok_url: fields.tiktok_url || null,
      video_url: fields.video_url || null,
      google_reviews_url: fields.google_reviews_url || null,
      gallery_images: Array.isArray(fields.gallery_images) ? fields.gallery_images : undefined,
    }

    // Retirer les clés undefined
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(updatePayload)) {
      if (v !== undefined) cleaned[k] = v
    }

    const { data, error } = await supabaseAdmin
      .from('providers')
      .update(cleaned)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Error updating provider:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, provider: data })
  } catch (err: any) {
    console.error('Error in update-provider:', err)
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
