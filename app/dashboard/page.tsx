'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { signOut } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase-client'
import { HiPhone, HiGlobeAlt, HiEye, HiPlus, HiPencil, HiTrash, HiSparkles, HiDocumentText } from 'react-icons/hi'
import Link from 'next/link'
import type { Provider } from '@/lib/supabase'
import ConfirmDialog from '@/components/ConfirmDialog'
import Toast from '@/components/Toast'
import NotificationBell from '@/components/NotificationBell'
import DashboardSidebar from '@/components/DashboardSidebar'

interface DashboardStats {
  totalProviders: number
  totalViews: number
  totalPhoneClicks: number
  totalWebsiteClicks: number
}

export default function DashboardPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalProviders: 0,
    totalViews: 0,
    totalPhoneClicks: 0,
    totalWebsiteClicks: 0,
  })
  const [providers, setProviders] = useState<Provider[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [userName, setUserName] = useState('')
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<{ id: number; name: string } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/espace-pro')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchProviders()
      fetchCategories()
      // Récupérer le nom de l'utilisateur depuis les metadata ou l'email
      const email = user.email || ''
      const firstName = user.user_metadata?.first_name || ''
      const lastName = user.user_metadata?.last_name || ''
      if (firstName || lastName) {
        setUserName(`${firstName} ${lastName}`.trim() || email.split('@')[0])
      } else {
        const name = email.split('@')[0]
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
      }
    }
  }, [user])


  const fetchCategories = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('provider_categories')
        .select('id, name')

      if (error) {
        console.error('Error fetching categories:', error)
        return
      }

      const categoriesMap: Record<number, string> = {}
      data?.forEach((cat) => {
        categoriesMap[cat.id] = cat.name
      })
      setCategories(categoriesMap)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // Récupérer tous les prestataires de l'utilisateur
      const { data: userProviders, error } = await supabase
        .from('providers')
        .select('views, phone_clicks, website_clicks')
        .eq('user_id', currentUser.id)

      if (error) {
        console.error('Error fetching stats:', error)
        return
      }

      const totalStats: DashboardStats = {
        totalProviders: userProviders?.length || 0,
        totalViews: userProviders?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
        totalPhoneClicks: userProviders?.reduce((sum, p) => sum + (p.phone_clicks || 0), 0) || 0,
        totalWebsiteClicks: userProviders?.reduce((sum, p) => sum + (p.website_clicks || 0), 0) || 0,
      }

      setStats(totalStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchProviders = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) {
        console.error('Error fetching providers:', error)
        return
      }

      setProviders(data as Provider[] || [])
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }


  const handleDeleteClick = (providerId: number, providerName: string) => {
    setProviderToDelete({ id: providerId, name: providerName })
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return

    setDeletingId(providerToDelete.id)
    setShowDeleteConfirm(false)
    
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', providerToDelete.id)

      if (error) {
        console.error('Error deleting provider:', error)
        setToast({ message: 'Erreur lors de la suppression de la fiche.', type: 'error' })
        setDeletingId(null)
        return
      }

      // Recharger la liste des prestataires et les stats
      await fetchProviders()
      await fetchStats()
      setToast({ message: 'Fiche supprimée avec succès.', type: 'success' })
    } catch (error) {
      console.error('Error deleting provider:', error)
      setToast({ message: 'Erreur lors de la suppression de la fiche.', type: 'error' })
    } finally {
      setDeletingId(null)
      setProviderToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setProviderToDelete(null)
  }

  // Récupérer l'image à afficher
  const getProviderImage = (provider: Provider): string | null => {
    if (provider.gallery_images) {
      let galleryImages: string[] = []
      if (Array.isArray(provider.gallery_images)) {
        galleryImages = provider.gallery_images
      } else if (typeof provider.gallery_images === 'string') {
        try {
          galleryImages = JSON.parse(provider.gallery_images)
        } catch (e) {
          galleryImages = []
        }
      }
      if (galleryImages.length > 0 && galleryImages[0]) {
        return galleryImages[0]
      }
    }
    return provider.logo_url
  }

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-secondary">
        <p className="text-dashboard-text-secondary">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dashboard-bg-secondary flex">
      <DashboardSidebar userName={userName} userEmail={user.email || ''} activePath="/dashboard" />

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] w-full">
        <div className="dashboard-content p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="dashboard-h1 mb-2 text-2xl sm:text-3xl">
                Bonjour, {userName}!
              </h1>
              <p className="dashboard-text text-dashboard-text-secondary">
                Voici un aperçu de votre activité.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <NotificationBell />
              <Link
                href="/dashboard/fiches/nouvelle"
                className="dashboard-btn-primary flex items-center space-x-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center"
              >
                <HiPlus className="text-lg sm:text-xl" />
                <span>Créer une fiche</span>
              </Link>
            </div>
          </div>


          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            {/* Fiches créées */}
            <div className="dashboard-card border border-dashboard-border p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dashboard-info/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiDocumentText className="text-dashboard-info text-xl sm:text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="dashboard-text text-dashboard-text-main mb-1 text-sm sm:text-base">Fiches créées</p>
                  <h3 className="dashboard-card-value text-xl sm:text-2xl">{stats.totalProviders}</h3>
                </div>
              </div>
            </div>

            {/* Vues totales */}
            <div className="dashboard-card border border-dashboard-border p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dashboard-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiEye className="text-dashboard-success text-xl sm:text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="dashboard-text text-dashboard-text-main mb-1 text-sm sm:text-base">Vues totales</p>
                  <h3 className="dashboard-card-value text-xl sm:text-2xl">{stats.totalViews}</h3>
                </div>
              </div>
            </div>

            {/* Clics téléphone */}
            <div className="dashboard-card border border-dashboard-border p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dashboard-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiPhone className="text-dashboard-primary text-xl sm:text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="dashboard-text text-dashboard-text-main mb-1 text-sm sm:text-base">Clics téléphone</p>
                  <h3 className="dashboard-card-value text-xl sm:text-2xl">{stats.totalPhoneClicks}</h3>
                </div>
              </div>
            </div>

            {/* Clics site web */}
            <div className="dashboard-card border border-dashboard-border p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dashboard-info/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiGlobeAlt className="text-dashboard-info text-xl sm:text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="dashboard-text text-dashboard-text-main mb-1 text-sm sm:text-base">Clics site web</p>
                  <h3 className="dashboard-card-value text-xl sm:text-2xl">{stats.totalWebsiteClicks}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Dernières fiches */}
          <div className="dashboard-card border border-dashboard-border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              <h2 className="dashboard-h2 text-xl sm:text-2xl">Vos dernières fiches</h2>
              <Link
                href="/dashboard/fiches"
                className="text-dashboard-primary hover:text-dashboard-primary/80 font-semibold flex items-center space-x-1 dashboard-text text-sm sm:text-base"
              >
                <span>Voir tout</span>
                <HiPlus className="text-sm" />
              </Link>
            </div>

            {providers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="dashboard-text text-dashboard-text-secondary mb-4">Vous n'avez pas encore de fiches.</p>
                <Link
                  href="/dashboard/fiches/nouvelle"
                  className="dashboard-btn-primary inline-block text-sm sm:text-base"
                >
                  Créer votre première fiche
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {providers.map((provider) => {
                  const imageUrl = getProviderImage(provider)
                  const categoryName = categories[provider.category_id] || 'Non catégorisé'
                  const isDeleting = deletingId === provider.id

                  return (
                    <div key={provider.id} className="dashboard-card border border-dashboard-border hover:shadow-button-hover transition p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Image à gauche - carrée avec coins arrondis */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-dashboard-bg-secondary rounded-lg flex-shrink-0 overflow-hidden border border-dashboard-border">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={provider.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-dashboard-text-light dashboard-text-secondary text-xs">
                              Pas d'image
                            </div>
                          )}
                        </div>

                        {/* Contenu central */}
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                          {/* Nom et tag Publiée sur la même ligne */}
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <h3 className="dashboard-text font-semibold text-dashboard-text-main truncate text-sm sm:text-base">
                              {provider.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="px-2 sm:px-3 py-1 bg-dashboard-success/10 text-dashboard-success rounded-full dashboard-text-secondary font-medium whitespace-nowrap text-xs sm:text-sm">
                                Publiée
                              </span>
                              {/* Bouton Supprimer - rouge carré */}
                              <button
                                onClick={() => handleDeleteClick(provider.id, provider.name)}
                                disabled={isDeleting}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-dashboard-alert text-white rounded-lg flex items-center justify-center hover:bg-dashboard-alert/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Supprimer"
                              >
                                {isDeleting ? (
                                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <HiTrash className="text-xs sm:text-sm" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Catégorie */}
                          <p className="dashboard-h3 mb-2 text-sm sm:text-base">
                            {categoryName}
                          </p>

                          {/* Statistiques */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 dashboard-text-secondary text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <HiEye className="text-dashboard-text-light text-sm sm:text-base" />
                              <span className="dashboard-text-secondary">{provider.views || 0} vues</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HiPhone className="text-dashboard-text-light text-sm sm:text-base" />
                              <span className="dashboard-text-secondary">{provider.phone_clicks || 0} clics</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HiGlobeAlt className="text-dashboard-text-light text-sm sm:text-base" />
                              <span className="dashboard-text-secondary">{provider.website_clicks || 0} clics</span>
                            </div>
                          </div>
                        </div>

                        {/* Boutons à droite */}
                        <div className="flex flex-row sm:flex-col flex-shrink-0 gap-2 sm:gap-[11px] w-full sm:w-auto">
                          {/* Bouton Aperçu - blanc avec icône et texte noirs */}
                          <Link
                            href={`/annuaire/prestataire/${provider.slug}`}
                            target="_blank"
                            className="bg-white border border-dashboard-border text-dashboard-text-main rounded-lg flex items-center justify-center gap-2 px-3 py-1.5 hover:bg-dashboard-hover transition dashboard-text font-semibold text-xs sm:text-sm flex-1 sm:flex-initial"
                          >
                            <HiEye className="text-sm sm:text-base text-dashboard-text-main" />
                            <span>Aperçu</span>
                          </Link>

                          {/* Bouton Modifier - rose avec icône et texte blancs */}
                          <Link
                            href={`/dashboard/fiches/${provider.slug}`}
                            className="bg-dashboard-primary text-white rounded-lg flex items-center justify-center gap-2 px-3 py-1.5 hover:bg-dashboard-primary/90 transition dashboard-text font-semibold text-xs sm:text-sm flex-1 sm:flex-initial"
                          >
                            <HiPencil className="text-sm sm:text-base text-white" />
                            <span className="text-white">Modifier</span>
                          </Link>

                          {/* Bouton Mettre en avant */}
                          <Link
                            href="/dashboard/mise-en-avant"
                            className="bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg flex items-center justify-center gap-2 px-3 py-1.5 transition dashboard-text font-semibold text-xs sm:text-sm flex-1 sm:flex-initial"
                          >
                            <HiSparkles className="text-sm sm:text-base text-primary-700" />
                            <span className="hidden sm:inline">Mettre en avant</span>
                            <span className="sm:hidden">Boost</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Êtes-vous sûr ?"
        message="Cette action est irréversible. Votre fiche sera définitivement supprimée de nos serveurs."
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Toast pour les notifications */}
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
