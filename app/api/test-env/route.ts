import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Ne pas exposer les valeurs réelles des clés pour la sécurité
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✅' : 'MISSING ❌',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✅' : 'MISSING ❌',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET ✅' : 'MISSING ❌',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    // Afficher juste le début de l'URL pour vérification
    supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` 
      : 'NOT SET',
  })
}

