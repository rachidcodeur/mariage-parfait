'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { HiArrowLeft, HiCheckCircle, HiXCircle, HiClock, HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiFilter, HiSparkles, HiHeart } from 'react-icons/hi'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { signOut } from '@/lib/auth'
import type { Provider } from '@/lib/supabase'

interface ProviderClaim {
  id: number | string
  provider_id: number
  user_id: string
  justification?: string
  claim_reason?: string
  user_justification?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  provider?: Provider
}

export default function MesRevendicationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (!pathname) return false
    if (pathname === path) return true
    if (path === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(path + '/')
  }
  const [claims, setClaims] = useState<ProviderClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/espace-pro')
      return
    }

    if (user) {
      // Récupérer le nom de l'utilisateur
      const email = user.email || ''
      const firstName = user.user_metadata?.first_name || ''
      const lastName = user.user_metadata?.last_name || ''
      if (firstName || lastName) {
        setUserName(`${firstName} ${lastName}`.trim() || email.split('@')[0])
      } else {
        const name = email.split('@')[0]
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
      }

      loadClaims()
    }
  }, [user, authLoading, router])

  const loadClaims = async () => {
    if (!user) return

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // Récupérer toutes les revendications de l'utilisateur
      const { data: claimsData, error: claimsError } = await supabase
        .from('provider_claims')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (claimsError) {
        console.error('Error loading claims:', claimsError)
        return
      }

      // Récupérer les providers
      const providerIds = (claimsData || []).map((claim: any) => claim.provider_id)
      if (providerIds.length > 0) {
        const { data: providersData, error: providersError } = await supabase
          .from('providers')
          .select('*')
          .in('id', providerIds)

        if (providersError) {
          console.error('Error loading providers:', providersError)
        } else {
          const providersMap = new Map((providersData || []).map((p: any) => [p.id, p]))
          const claimsWithProviders = (claimsData || []).map((claim: any) => ({
            ...claim,
            provider: providersMap.get(claim.provider_id),
          }))
          setClaims(claimsWithProviders)
        }
      } else {
        setClaims(claimsData || [])
      }
    } catch (error) {
      console.error('Error loading claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full dashboard-text-secondary font-medium">
            En attente
          </span>
        )
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full dashboard-text-secondary font-medium">
            Approuvée
          </span>
        )
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full dashboard-text-secondary font-medium">
            Rejetée
          </span>
        )
      default:
        return null
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-secondary">
        <p className="text-dashboard-text-secondary">Chargement...</p>
      </div>
    )
  }

  const pendingCount = claims.filter(c => c.status === 'pending').length
  const approvedCount = claims.filter(c => c.status === 'approved').length
  const rejectedCount = claims.filter(c => c.status === 'rejected').length

  return (
    <div className="min-h-screen bg-dashboard-bg-secondary flex">
      {/* Sidebar - 240px selon manifeste */}
      <aside className="dashboard-sidebar shadow-lg fixed h-full border-r border-dashboard-border">
        <div className="p-6 border-b border-dashboard-border">
          <Link href="/" className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-dashboard-primary rounded-lg flex items-center justify-center">
              <HiHeart className="text-white text-xl" />
            </div>
            <span className="text-xl font-semibold text-dashboard-text-main">Mariage Parfait</span>
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition"
          >
            <HiHome className="text-lg" />
            <span className="dashboard-text">Retour à l'accueil</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard')
                ? 'font-semibold'
                : 'text-dashboard-text-secondary hover:bg-dashboard-hover'
            }`}
            style={isActive('/dashboard') ? { backgroundColor: '#fce7f3', color: '#ca3b76' } : {}}
          >
            <HiViewGrid className="text-xl" />
            <span className="dashboard-text">Tableau de bord</span>
          </Link>
          <Link
            href="/dashboard/fiches"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard/fiches')
                ? 'font-semibold'
                : 'text-dashboard-text-secondary hover:bg-dashboard-hover'
            }`}
            style={isActive('/dashboard/fiches') ? { backgroundColor: '#fce7f3', color: '#ca3b76' } : {}}
          >
            <HiDocumentText className="text-xl" />
            <span className="dashboard-text">Mes fiches</span>
          </Link>
          <Link
            href="/dashboard/mise-en-avant"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard/mise-en-avant')
                ? 'font-semibold'
                : 'text-dashboard-text-secondary hover:bg-dashboard-hover'
            }`}
            style={isActive('/dashboard/mise-en-avant') ? { backgroundColor: '#fce7f3', color: '#ca3b76' } : {}}
          >
            <HiSparkles className="text-xl" />
            <span className="dashboard-text">Mise en avant</span>
          </Link>
          <Link
            href="/dashboard/revendications"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard/revendications')
                ? 'font-semibold'
                : 'text-dashboard-text-secondary hover:bg-dashboard-hover'
            }`}
            style={isActive('/dashboard/revendications') ? { backgroundColor: '#fce7f3', color: '#ca3b76' } : {}}
          >
            <HiClock className="text-xl" />
            <span className="dashboard-text">Mes revendications</span>
          </Link>
          <Link
            href="/dashboard/parametres"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard/parametres')
                ? 'font-semibold'
                : 'text-dashboard-text-secondary hover:bg-dashboard-hover'
            }`}
            style={isActive('/dashboard/parametres') ? { backgroundColor: '#fce7f3', color: '#ca3b76' } : {}}
          >
            <HiCog className="text-xl" />
            <span className="dashboard-text">Paramètres</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dashboard-border">
          <div className="mb-4">
            <p className="text-sm font-semibold text-dashboard-text-main">{userName} Prestataire</p>
            <p className="dashboard-text-secondary">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-alert transition w-full"
          >
            <HiLogout className="text-lg" />
            <span className="dashboard-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content - margin 24px selon manifeste */}
      <main className="flex-1 ml-[240px]">
        <div className="dashboard-content px-[170px]">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition mb-4"
            >
              <HiArrowLeft className="text-lg" />
              <span className="dashboard-text">Retour au tableau de bord</span>
            </Link>
            <h1 className="dashboard-h1">Mes Revendications</h1>
            <p className="dashboard-text text-dashboard-text-secondary mt-2">
              Consultez l'état de vos demandes de revendication de fiches
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="dashboard-card border border-dashboard-border">
              <p className="dashboard-text text-dashboard-text-secondary mb-1">Total</p>
              <h3 className="dashboard-card-value">{claims.length}</h3>
            </div>
            <div className="dashboard-card border border-dashboard-border">
              <p className="dashboard-text text-dashboard-text-secondary mb-1">En attente</p>
              <h3 className="dashboard-card-value text-yellow-600">{pendingCount}</h3>
            </div>
            <div className="dashboard-card border border-dashboard-border">
              <p className="dashboard-text text-dashboard-text-secondary mb-1">Approuvées</p>
              <h3 className="dashboard-card-value text-green-600">{approvedCount}</h3>
            </div>
            <div className="dashboard-card border border-dashboard-border">
              <p className="dashboard-text text-dashboard-text-secondary mb-1">Rejetées</p>
              <h3 className="dashboard-card-value text-red-600">{rejectedCount}</h3>
            </div>
          </div>

          {/* Liste des revendications */}
          {claims.length === 0 ? (
            <div className="dashboard-card border border-dashboard-border text-center py-12">
              <p className="dashboard-text text-dashboard-text-secondary">
                Vous n'avez pas encore fait de demande de revendication.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {claims.map((claim) => {
                const justification = claim.justification || claim.claim_reason || claim.user_justification || 'Aucune justification fournie'

                return (
                  <div
                    key={String(claim.id)}
                    className="dashboard-card border border-dashboard-border"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="dashboard-h2">
                            {claim.provider?.name || 'Fiche inconnue'}
                          </h3>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="dashboard-text-secondary text-sm">
                          Demandée le {formatDate(claim.created_at)}
                        </p>
                        {claim.reviewed_at && (
                          <p className="dashboard-text-secondary text-sm">
                            {claim.status === 'approved' ? 'Approuvée' : 'Rejetée'} le {formatDate(claim.reviewed_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Informations de la fiche */}
                    {claim.provider && (
                      <div className="mb-4 p-4 bg-dashboard-bg-secondary rounded-lg">
                        <p className="dashboard-h3 mb-1">Fiche concernée</p>
                        <p className="dashboard-text text-dashboard-text-main">{claim.provider.name}</p>
                        {claim.provider.email && (
                          <p className="dashboard-text-secondary text-sm mt-1">{claim.provider.email}</p>
                        )}
                        {claim.provider.phone && (
                          <p className="dashboard-text-secondary text-sm mt-1">{claim.provider.phone}</p>
                        )}
                      </div>
                    )}

                    {/* Justification */}
                    <div className="mb-4">
                      <p className="dashboard-h3 mb-2">Votre justification :</p>
                      <p className="dashboard-text text-dashboard-text-main bg-dashboard-bg-secondary p-4 rounded-lg">
                        {justification}
                      </p>
                    </div>

                    {/* Notes admin si rejetée */}
                    {claim.status === 'rejected' && claim.admin_notes && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="dashboard-h3 mb-1">Raison du rejet :</p>
                        <p className="dashboard-text text-dashboard-text-main">{claim.admin_notes}</p>
                      </div>
                    )}

                    {/* Message si approuvée */}
                    {claim.status === 'approved' && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <HiCheckCircle className="text-green-600 text-xl" />
                          <p className="dashboard-h3 text-green-800">Revendication approuvée !</p>
                        </div>
                        <p className="dashboard-text text-dashboard-text-main">
                          Votre demande a été approuvée. La fiche vous a été attribuée et vous pouvez maintenant la gérer depuis votre tableau de bord.
                        </p>
                        {claim.provider && (
                          <Link
                            href={`/dashboard/fiches/${claim.provider.slug}`}
                            className="inline-block mt-3 dashboard-btn-primary"
                          >
                            Gérer la fiche
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

