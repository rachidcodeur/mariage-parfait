'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import { HiX, HiCheckCircle, HiXCircle, HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi'
import Toast from './Toast'
import type { Provider } from '@/lib/supabase'

interface ProviderClaim {
  id: number | string // Peut être uuid ou bigserial selon la version
  provider_id: number
  user_id: string
  justification?: string // Nouvelle colonne
  claim_reason?: string // Ancienne colonne (fallback)
  user_justification?: string // Ancienne colonne (fallback)
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  provider?: Provider
  user_email?: string
  user_name?: string
}

interface ClaimsModalProps {
  isOpen: boolean
  onClose: () => void
  onClaimProcessed: () => void
}

export default function ClaimsModal({ isOpen, onClose, onClaimProcessed }: ClaimsModalProps) {
  const [claims, setClaims] = useState<ProviderClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<number | string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadClaims()
    }
  }, [isOpen])

  const loadClaims = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Récupérer les revendications en attente
      const { data: claimsData, error: claimsError } = await supabase
        .from('provider_claims')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (claimsError) {
        console.error('Error loading claims:', claimsError)
        setToast({ message: 'Erreur lors du chargement des revendications.', type: 'error' })
        return
      }

      // Récupérer les providers séparément
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

      // Récupérer les emails des utilisateurs via l'API
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
            
            return {
              ...claim,
              provider: providersMap.get(claim.provider_id),
              user_email: email,
              user_name: firstName && lastName
                ? `${firstName} ${lastName}`
                : email.split('@')[0] || 'Utilisateur',
            }
          } catch (error) {
            console.error('Error fetching user info:', error)
            return {
              ...claim,
              provider: providersMap.get(claim.provider_id),
              user_email: 'Email non disponible',
              user_name: 'Utilisateur',
            }
          }
        })
      )

      setClaims(claimsWithUsers)
    } catch (error) {
      console.error('Error loading claims:', error)
      setToast({ message: 'Erreur lors du chargement des revendications.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (claimId: number | string, providerId: number, userId: string) => {
    setProcessingId(claimId)
    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        setToast({ message: 'Vous devez être connecté.', type: 'error' })
        setProcessingId(null)
        return
      }

      // Mettre à jour le statut de la revendication
      const { error: updateError } = await supabase
        .from('provider_claims')
        .update({
          status: 'approved',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[claimId] || null,
        })
        .eq('id', claimId)

      if (updateError) {
        console.error('Error approving claim:', updateError)
        setToast({ message: 'Erreur lors de l\'approbation.', type: 'error' })
        setProcessingId(null)
        return
      }

      // Transférer la fiche à l'utilisateur qui revendique
      const { error: transferError } = await supabase
        .from('providers')
        .update({
          user_id: userId,
          status: 'active', // Activer la fiche
        })
        .eq('id', providerId)

      if (transferError) {
        console.error('Error transferring provider:', transferError)
        setToast({ message: 'Erreur lors du transfert de la fiche.', type: 'error' })
        setProcessingId(null)
        return
      }

      setToast({ message: 'Revendication approuvée avec succès.', type: 'success' })
      await loadClaims()
      onClaimProcessed()
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
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        setToast({ message: 'Vous devez être connecté.', type: 'error' })
        setProcessingId(null)
        return
      }

      const { error } = await supabase
        .from('provider_claims')
        .update({
          status: 'rejected',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[claimId] || null,
        })
        .eq('id', claimId)

      if (error) {
        console.error('Error rejecting claim:', error)
        setToast({ message: 'Erreur lors du rejet.', type: 'error' })
        setProcessingId(null)
        return
      }

      setToast({ message: 'Revendication rejetée.', type: 'success' })
      await loadClaims()
      onClaimProcessed()
    } catch (error) {
      console.error('Error rejecting claim:', error)
      setToast({ message: 'Erreur lors du rejet.', type: 'error' })
    } finally {
      setProcessingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-modal w-full max-w-4xl mx-4 max-h-[90vh] z-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dashboard-border">
            <h2 className="dashboard-h1">Demandes de revendication</h2>
            <button
              onClick={onClose}
              className="text-dashboard-text-secondary hover:text-dashboard-text-main transition"
              aria-label="Fermer"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="dashboard-text text-dashboard-text-secondary">Chargement...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-12">
                <HiCheckCircle className="text-4xl text-dashboard-success mx-auto mb-4" />
                <p className="dashboard-text text-dashboard-text-secondary">
                  Aucune demande de revendication en attente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="dashboard-card border border-dashboard-border"
                  >
                    <div className="flex items-start gap-4">
                      {/* Image du provider */}
                      <div className="w-20 h-20 bg-dashboard-bg-secondary rounded-lg flex-shrink-0 overflow-hidden border border-dashboard-border">
                        {claim.provider?.gallery_images && claim.provider.gallery_images.length > 0 ? (
                          <img
                            src={claim.provider.gallery_images[0]}
                            alt={claim.provider.name}
                            className="w-full h-full object-cover"
                          />
                        ) : claim.provider?.logo_url ? (
                          <img
                            src={claim.provider.logo_url}
                            alt={claim.provider.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dashboard-text-light dashboard-text-secondary text-xs">
                            Pas d'image
                          </div>
                        )}
                      </div>

                      {/* Informations */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="dashboard-h2 mb-1">{claim.provider?.name || 'Fiche non trouvée'}</h3>
                            <div className="flex items-center gap-2 dashboard-text-secondary text-sm mb-2">
                              <HiClock className="text-dashboard-text-light" />
                              <span>
                                {new Date(claim.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Informations du provider */}
                        {claim.provider && (
                          <div className="space-y-1 mb-3">
                            {claim.provider.email && (
                              <div className="flex items-center gap-2 dashboard-text text-dashboard-text-main text-sm">
                                <HiMail className="text-dashboard-text-light" />
                                <span>{claim.provider.email}</span>
                              </div>
                            )}
                            {claim.provider.phone && (
                              <div className="flex items-center gap-2 dashboard-text text-dashboard-text-main text-sm">
                                <HiPhone className="text-dashboard-text-light" />
                                <span>{claim.provider.phone}</span>
                              </div>
                            )}
                            {claim.provider.city && (
                              <div className="flex items-center gap-2 dashboard-text text-dashboard-text-main text-sm">
                                <HiLocationMarker className="text-dashboard-text-light" />
                                <span>{claim.provider.city}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Informations du demandeur */}
                        <div className="mb-3 p-3 bg-dashboard-bg-secondary rounded-lg">
                          <p className="dashboard-h3 mb-1">Demandeur : {claim.user_name}</p>
                          <p className="dashboard-text-secondary text-sm">{claim.user_email}</p>
                        </div>

                        {/* Justification */}
                        <div className="mb-3">
                          <p className="dashboard-h3 mb-1">Justification :</p>
                          <p className="dashboard-text text-dashboard-text-main">
                            {claim.justification || claim.claim_reason || claim.user_justification || 'Aucune justification fournie'}
                          </p>
                        </div>

                        {/* Notes admin */}
                        <div className="mb-3">
                          <label className="block dashboard-h3 mb-2">
                            Notes (optionnel)
                          </label>
                          <textarea
                            value={adminNotes[claim.id] || ''}
                            onChange={(e) => setAdminNotes(prev => ({ ...prev, [claim.id]: e.target.value }))}
                            className="dashboard-input w-full"
                            placeholder="Ajoutez des notes pour cette revendication..."
                            rows={2}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(claim.id, claim.provider_id, claim.user_id)}
                            disabled={processingId === claim.id}
                            className="bg-dashboard-success hover:bg-dashboard-success/90 !text-white px-6 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <HiCheckCircle className="text-lg" />
                            {processingId === claim.id ? 'Traitement...' : 'Approuver'}
                          </button>
                          <button
                            onClick={() => handleReject(claim.id)}
                            disabled={processingId === claim.id}
                            className="bg-dashboard-alert hover:bg-dashboard-alert/90 !text-white px-6 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <HiXCircle className="text-lg" />
                            {processingId === claim.id ? 'Traitement...' : 'Rejeter'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

