'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { isSuperAdmin } from '@/lib/admin-utils'
import { HiArrowLeft, HiCheckCircle, HiXCircle, HiMail, HiPhone, HiClock, HiFilter, HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiHeart } from 'react-icons/hi'
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
  user_email?: string
  user_name?: string
  user_phone?: string
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminClaimsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [claims, setClaims] = useState<ProviderClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/espace-pro')
        return
      }

      const admin = await isSuperAdmin(user)
      setIsAdmin(admin)

      if (!admin) {
        router.push('/dashboard')
        return
      }

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

    if (!authLoading) {
      checkAdmin()
    }
  }, [user, authLoading, router])

  const loadClaims = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Construire la requête selon le filtre
      let query = supabase
        .from('provider_claims')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data: claimsData, error: claimsError } = await query
      
      console.log('Chargement des revendications - Filtre:', filterStatus, 'Nombre trouvé:', claimsData?.length || 0)
      if (claimsData && claimsData.length > 0) {
        console.log('IDs des revendications chargées:', claimsData.map((c: any) => ({ id: c.id, status: c.status })))
      }

      if (claimsError) {
        console.error('Error loading claims:', claimsError)
        setToast({ message: 'Erreur lors du chargement des revendications.', type: 'error' })
        return
      }

      // Récupérer les providers
      const providerIds = (claimsData || []).map((claim: any) => claim.provider_id)
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('*')
        .in('id', providerIds)

      if (providersError) {
        console.error('Error loading providers:', providersError)
        setToast({ message: 'Erreur lors du chargement des fiches.', type: 'error' })
        return
      }

      const providersMap = new Map((providersData || []).map((p: any) => [p.id, p]))

      // Récupérer les informations des utilisateurs
      const claimsWithUsers = await Promise.all(
        (claimsData || []).map(async (claim: any) => {
          try {
            const response = await fetch('/api/admin/get-user-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: claim.user_id }),
            })

            const userData = response.ok ? await response.json() : null
            const firstName = userData?.first_name || ''
            const lastName = userData?.last_name || ''
            const email = userData?.email || 'Email non disponible'
            const phone = userData?.phone || 'Téléphone non renseigné'
            
            return {
              ...claim,
              provider: providersMap.get(claim.provider_id),
              user_email: email,
              user_name: firstName && lastName
                ? `${firstName} ${lastName}`
                : email.split('@')[0],
              user_phone: phone,
            }
          } catch (error) {
            console.error('Error fetching user info:', error)
            return {
              ...claim,
              provider: providersMap.get(claim.provider_id),
              user_email: 'Email non disponible',
              user_name: 'Utilisateur inconnu',
              user_phone: 'Téléphone non renseigné',
            }
          }
        })
      )

      // Filtrer les revendications rejetées si on est sur le filtre "pending"
      // Cela évite qu'une revendication rejetée réapparaisse si Supabase n'a pas encore propagé la mise à jour
      const filteredClaims = filterStatus === 'pending' 
        ? claimsWithUsers.filter((claim: any) => {
            const status = claim.status || (claim as ProviderClaim).status
            const isPending = status === 'pending'
            if (!isPending) {
              console.log('🚫 Filtrage d\'une revendication non-pending du filtre pending:', claim.id, 'statut:', status)
            }
            return isPending
          })
        : claimsWithUsers
      
      console.log('📊 Revendications après filtrage - Filtre:', filterStatus, 'Total:', filteredClaims.length)
      if (filterStatus === 'pending' && filteredClaims.length !== claimsWithUsers.length) {
        console.log('   ⚠️ Certaines revendications ont été filtrées (non-pending dans le filtre pending)')
      }
      
      setClaims(filteredClaims)
    } catch (error) {
      console.error('Error loading claims:', error)
      setToast({ message: 'Erreur lors du chargement des revendications.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadClaims()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, isAdmin])

  const handleApprove = async (claimId: number | string, providerId: number, userId: string) => {
    setProcessingId(claimId)
    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        setToast({ message: 'Vous devez être connecté.', type: 'error' })
        setProcessingId(null)
        return
      }

      // Obtenir le token de session pour l'API
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setToast({ message: 'Erreur: session invalide.', type: 'error' })
        setProcessingId(null)
        return
      }

      // Utiliser l'API admin pour contourner les RLS
      const response = await fetch('/api/admin/approve-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          claimId: claimId,
          adminNotes: adminNotes[String(claimId)] || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', result.error)
        setToast({ message: result.error || 'Erreur lors de l\'approbation.', type: 'error' })
        setProcessingId(null)
        return
      }

      if (!result.success || !result.claim) {
        console.error('❌ Réponse API invalide:', result)
        setToast({ message: 'Erreur: réponse invalide du serveur.', type: 'error' })
        setProcessingId(null)
        return
      }

      const updatedClaim = result.claim
      console.log('✅ Revendication approuvée avec succès:', updatedClaim)

      // Retirer immédiatement la revendication de la liste si on est sur le filtre "pending"
      if (filterStatus === 'pending') {
        setClaims(prev => prev.filter(claim => String(claim.id) !== String(claimId)))
      }

      setToast({ message: 'Revendication approuvée avec succès.', type: 'success' })
      
      // Recharger les revendications pour mettre à jour les statistiques
      await loadClaims()
    } catch (error) {
      console.error('Error approving claim:', error)
      setToast({ message: 'Erreur lors de l\'approbation.', type: 'error' })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (claimId: number | string) => {
    setProcessingId(claimId)
    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        setToast({ message: 'Vous devez être connecté.', type: 'error' })
        setProcessingId(null)
        return
      }

      // Obtenir le token de session pour l'API
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setToast({ message: 'Erreur: session invalide.', type: 'error' })
        setProcessingId(null)
        return
      }

      // Utiliser l'API admin pour contourner les RLS
      const response = await fetch('/api/admin/reject-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          claimId: claimId,
          adminNotes: adminNotes[String(claimId)] || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', result.error)
        setToast({ message: result.error || 'Erreur lors du rejet.', type: 'error' })
        setProcessingId(null)
        return
      }

      if (!result.success || !result.claim) {
        console.error('❌ Réponse API invalide:', result)
        setToast({ message: 'Erreur: réponse invalide du serveur.', type: 'error' })
        setProcessingId(null)
        return
      }

      const updatedClaim = result.claim
      console.log('✅ Revendication rejetée avec succès:', updatedClaim)

      setToast({ message: 'Revendication rejetée.', type: 'success' })
      
      // Réinitialiser les notes admin pour cette revendication
      setAdminNotes(prev => {
        const newNotes = { ...prev }
        delete newNotes[String(claimId)]
        return newNotes
      })
      
      // Retirer immédiatement la revendication de la liste si on est sur le filtre "pending"
      // Faire cela AVANT le rechargement pour une mise à jour immédiate de l'UI
      if (filterStatus === 'pending') {
        setClaims(prev => {
          const beforeCount = prev.length
          const filtered = prev.filter(claim => {
            // Comparer les IDs en les convertissant en string pour éviter les problèmes de type
            const claimIdStr = String(claim.id)
            const rejectedIdStr = String(claimId)
            const shouldKeep = claimIdStr !== rejectedIdStr
            if (!shouldKeep) {
              console.log('🗑️ Retrait immédiat de la revendication:', rejectedIdStr, 'de la liste')
              console.log('   Type claim.id:', typeof claim.id, 'Type claimId:', typeof claimId)
              console.log('   Statut actuel:', claim.status)
            }
            return shouldKeep
          })
          console.log('✅ Revendication retirée de la liste. Avant:', beforeCount, 'Après:', filtered.length, 'ID rejeté:', claimId)
          if (beforeCount === filtered.length) {
            console.warn('⚠️ ATTENTION: La revendication n\'a pas été retirée!')
            console.log('   IDs dans la liste:', prev.map(c => ({ id: c.id, type: typeof c.id, status: c.status })))
            console.log('   ID à retirer:', claimId, 'type:', typeof claimId)
          }
          return filtered
        })
      }
      
      // Recharger immédiatement - le filtre côté client dans loadClaims() empêchera la réapparition
      // même si Supabase n'a pas encore propagé la mise à jour
      await loadClaims()
    } catch (error) {
      console.error('Error rejecting claim:', error)
      setToast({ message: 'Erreur lors du rejet.', type: 'error' })
    } finally {
      setProcessingId(null)
    }
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

  if (!isAdmin) {
    return null
  }

  const pendingCount = claims.filter(c => c.status === 'pending').length
  const approvedCount = claims.filter(c => c.status === 'approved').length
  const rejectedCount = claims.filter(c => c.status === 'rejected').length

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

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
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
          >
            <HiViewGrid className="text-xl" />
            <span className="dashboard-text">Tableau de bord</span>
          </Link>
          <Link
            href="/dashboard/fiches"
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
          >
            <HiDocumentText className="text-xl" />
            <span className="dashboard-text">Mes fiches</span>
          </Link>
          <Link
            href="/dashboard/revendications"
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
          >
            <HiClock className="text-xl" />
            <span className="dashboard-text">Mes revendications</span>
          </Link>
          <div className="pt-4 border-t border-dashboard-border">
            <p className="px-4 py-2 text-xs font-semibold text-dashboard-text-light uppercase">Administration</p>
            <Link
              href="/dashboard/admin/claims"
              className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition bg-dashboard-primary/10 text-dashboard-primary"
            >
              <HiFilter className="text-xl" />
              <span className="dashboard-text font-semibold">Gestion des revendications</span>
            </Link>
          </div>
          <Link
            href="/dashboard/parametres"
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
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
        <div className="dashboard-content">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition mb-4"
          >
            <HiArrowLeft className="text-lg" />
            <span className="dashboard-text">Retour au tableau de bord</span>
          </Link>
          <h1 className="dashboard-h1">Gestion des Revendications</h1>
          <p className="dashboard-text text-dashboard-text-secondary mt-2">
            Gérez toutes les demandes de revendication de fiches
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

        {/* Filtres */}
        <div className="dashboard-card border border-dashboard-border mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <HiFilter className="text-dashboard-text-secondary" />
              <span className="dashboard-h3">Filtrer par statut :</span>
            </div>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition dashboard-text font-semibold ${
                filterStatus === 'all'
                  ? 'bg-dashboard-primary !text-white'
                  : 'bg-dashboard-bg-secondary text-dashboard-text-main hover:bg-dashboard-hover'
              }`}
            >
              Toutes ({claims.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg transition dashboard-text font-semibold ${
                filterStatus === 'pending'
                  ? 'bg-dashboard-primary !text-white'
                  : 'bg-dashboard-bg-secondary text-dashboard-text-main hover:bg-dashboard-hover'
              }`}
            >
              En attente ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg transition dashboard-text font-semibold ${
                filterStatus === 'approved'
                  ? 'bg-dashboard-success !text-white'
                  : 'bg-dashboard-bg-secondary text-dashboard-text-main hover:bg-dashboard-hover'
              }`}
            >
              Approuvées ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg transition dashboard-text font-semibold ${
                filterStatus === 'rejected'
                  ? 'bg-dashboard-alert !text-white'
                  : 'bg-dashboard-bg-secondary text-dashboard-text-main hover:bg-dashboard-hover'
              }`}
            >
              Rejetées ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Liste des revendications */}
        {claims.length === 0 ? (
          <div className="dashboard-card border border-dashboard-border text-center py-12">
            <p className="dashboard-text text-dashboard-text-secondary">
              {filterStatus === 'all' 
                ? 'Aucune revendication pour le moment.'
                : `Aucune revendication ${filterStatus === 'pending' ? 'en attente' : filterStatus === 'approved' ? 'approuvée' : 'rejetée'}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => {
              const isProcessing = processingId === claim.id
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

                  {/* Informations du demandeur */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-dashboard-bg-secondary rounded-lg">
                    <div>
                      <p className="dashboard-h3 mb-1">Demandeur</p>
                      <p className="dashboard-text text-dashboard-text-main">{claim.user_name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <HiMail className="text-dashboard-text-light text-base" />
                        <a
                          href={`mailto:${claim.user_email}`}
                          className="dashboard-text text-dashboard-primary hover:underline"
                        >
                          {claim.user_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <HiPhone className="text-dashboard-text-light text-base" />
                        <a
                          href={`tel:${claim.user_phone}`}
                          className="dashboard-text text-dashboard-text-main hover:underline"
                        >
                          {claim.user_phone}
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="dashboard-h3 mb-1">Fiche concernée</p>
                      {claim.provider ? (
                        <div>
                          <p className="dashboard-text text-dashboard-text-main">{claim.provider.name}</p>
                          {claim.provider.email && (
                            <p className="dashboard-text-secondary text-sm mt-1">{claim.provider.email}</p>
                          )}
                          {claim.provider.phone && (
                            <p className="dashboard-text-secondary text-sm mt-1">{claim.provider.phone}</p>
                          )}
                        </div>
                      ) : (
                        <p className="dashboard-text-secondary">Fiche non trouvée</p>
                      )}
                    </div>
                  </div>

                  {/* Justification */}
                  <div className="mb-4">
                    <p className="dashboard-h3 mb-2">Justification :</p>
                    <p className="dashboard-text text-dashboard-text-main bg-dashboard-bg-secondary p-4 rounded-lg">
                      {justification}
                    </p>
                  </div>

                  {/* Notes admin */}
                  <div className="mb-4">
                    <label className="block dashboard-h3 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={adminNotes[String(claim.id)] || ''}
                      onChange={(e) => setAdminNotes(prev => ({ ...prev, [String(claim.id)]: e.target.value }))}
                      className="dashboard-input w-full min-h-[100px]"
                      placeholder="Ajoutez des notes pour cette revendication..."
                      disabled={isProcessing || claim.status !== 'pending'}
                    />
                  </div>

                  {/* Actions */}
                  {claim.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(claim.id, claim.provider_id, claim.user_id)}
                        disabled={isProcessing}
                        className="dashboard-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Traitement...</span>
                          </>
                        ) : (
                          <>
                            <HiCheckCircle className="text-lg" />
                            <span>Approuver</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(claim.id)}
                        disabled={isProcessing}
                        className="bg-dashboard-alert hover:bg-dashboard-alert/90 !text-white px-6 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="!text-white">Traitement...</span>
                          </>
                        ) : (
                          <>
                            <HiXCircle className="text-lg !text-white" />
                            <span className="!text-white">Rejeter</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Notes admin existantes */}
                  {claim.admin_notes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="dashboard-h3 mb-1">Notes de l'administrateur :</p>
                      <p className="dashboard-text text-dashboard-text-main">{claim.admin_notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

