'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { isSuperAdmin } from '@/lib/admin-utils'
import { HiArrowLeft, HiSearch, HiMail, HiPhone, HiPencil, HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiHeart, HiFilter, HiTrash } from 'react-icons/hi'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { signOut } from '@/lib/auth'

interface ProviderSearchResult {
  id: number
  name: string
  slug: string
  email: string | null
  phone: string | null
  city: string | null
  category_id: number
  status: string
  created_at: string
}

export default function AdminFichesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email')
  const [searching, setSearching] = useState(false)
  const [providers, setProviders] = useState<ProviderSearchResult[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)

  useEffect(() => {
    const check = async () => {
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
      const email = user.email || ''
      const firstName = user.user_metadata?.first_name || ''
      const lastName = user.user_metadata?.last_name || ''
      if (firstName || lastName) {
        setUserName(`${firstName} ${lastName}`.trim() || email.split('@')[0])
      } else {
        setUserName((email.split('@')[0] || 'Admin').charAt(0).toUpperCase() + (email.split('@')[0] || '').slice(1))
      }
    }
    if (!authLoading) check()
  }, [user, authLoading, router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const term = searchInput.trim()
    if (!term) {
      setToast({ message: 'Saisissez un email ou un numéro de téléphone.', type: 'info' })
      return
    }

    setSearching(true)
    setProviders([])
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setToast({ message: 'Session expirée. Reconnectez-vous.', type: 'error' })
        setSearching(false)
        return
      }

      const body = searchType === 'email' ? { email: term } : { phone: term }
      const response = await fetch('/api/admin/search-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        setToast({ message: result.error || 'Erreur lors de la recherche.', type: 'error' })
        setSearching(false)
        return
      }

      const list = result.providers || []
      setProviders(list)
      if (list.length === 0) {
        setToast({ message: 'Aucune fiche trouvée pour ce critère.', type: 'info' })
      }
    } catch (err: any) {
      setToast({ message: err?.message || 'Erreur lors de la recherche.', type: 'error' })
    } finally {
      setSearching(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  const handleDelete = async (p: ProviderSearchResult) => {
    if (!confirm(`Supprimer définitivement la fiche « ${p.name} » ? Cette action est irréversible.`)) {
      return
    }
    setDeletingSlug(p.slug)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setToast({ message: 'Session expirée. Reconnectez-vous.', type: 'error' })
        setDeletingSlug(null)
        return
      }
      const response = await fetch('/api/admin/delete-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ slug: p.slug }),
      })
      const result = await response.json()
      if (!response.ok) {
        setToast({ message: result.error || 'Erreur lors de la suppression.', type: 'error' })
        setDeletingSlug(null)
        return
      }
      setProviders((prev) => prev.filter((x) => x.slug !== p.slug))
      setToast({ message: 'Fiche supprimée.', type: 'success' })
    } catch (err: any) {
      setToast({ message: err?.message || 'Erreur lors de la suppression.', type: 'error' })
    } finally {
      setDeletingSlug(null)
    }
  }

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-secondary">
        <p className="text-dashboard-text-secondary">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dashboard-bg-secondary flex">
      <aside className="dashboard-sidebar shadow-lg fixed h-full border-r border-dashboard-border">
        <div className="p-6 border-b border-dashboard-border">
          <Link href="/" className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-dashboard-primary rounded-lg flex items-center justify-center">
              <HiHeart className="text-white text-xl" />
            </div>
            <span className="text-xl font-semibold text-dashboard-text-main">Mariage Parfait</span>
          </Link>
          <Link href="/" className="flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition">
            <HiHome className="text-lg" />
            <span className="dashboard-text">Retour à l&apos;accueil</span>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition">
            <HiViewGrid className="text-xl" />
            <span className="dashboard-text">Tableau de bord</span>
          </Link>
          <Link href="/dashboard/fiches" className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition">
            <HiDocumentText className="text-xl" />
            <span className="dashboard-text">Mes fiches</span>
          </Link>
          <div className="pt-4 border-t border-dashboard-border">
            <p className="px-4 py-2 text-xs font-semibold text-dashboard-text-light uppercase">Administration</p>
            <Link href="/dashboard/admin/claims" className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition">
              <HiFilter className="text-xl" />
              <span className="dashboard-text">Gestion des revendications</span>
            </Link>
            <Link href="/dashboard/admin/fiches" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-dashboard-primary/10 text-dashboard-primary">
              <HiPencil className="text-xl" />
              <span className="dashboard-text font-semibold">Modifier une fiche</span>
            </Link>
          </div>
          <Link href="/dashboard/parametres" className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition">
            <HiCog className="text-xl" />
            <span className="dashboard-text">Paramètres</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dashboard-border">
          <div className="mb-4">
            <p className="text-sm font-semibold text-dashboard-text-main">{userName}</p>
            <p className="dashboard-text-secondary">{user?.email}</p>
          </div>
          <button type="button" onClick={handleLogout} className="flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-alert transition w-full">
            <HiLogout className="text-lg" />
            <span className="dashboard-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[240px]">
        <div className="dashboard-content">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition mb-4">
              <HiArrowLeft className="text-lg" />
              <span className="dashboard-text">Retour au tableau de bord</span>
            </Link>
            <h1 className="dashboard-h1">Modifier une fiche prestataire</h1>
            <p className="dashboard-text text-dashboard-text-secondary mt-2">
              Recherchez une fiche par email ou téléphone du prestataire, puis cliquez sur Modifier pour éditer les informations et les images.
            </p>
          </div>

          <div className="dashboard-card border border-dashboard-border mb-6">
            <h2 className="dashboard-h2 mb-4">Rechercher une fiche</h2>
            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="searchType" checked={searchType === 'email'} onChange={() => setSearchType('email')} className="rounded" />
                  <HiMail className="text-dashboard-text-secondary" />
                  <span className="dashboard-text">Email</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="searchType" checked={searchType === 'phone'} onChange={() => setSearchType('phone')} className="rounded" />
                  <HiPhone className="text-dashboard-text-secondary" />
                  <span className="dashboard-text">Téléphone</span>
                </label>
              </div>
              <input
                type={searchType === 'email' ? 'email' : 'tel'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchType === 'email' ? 'ex: contact@prestataire.fr' : 'ex: 06 12 34 56 78'}
                className="dashboard-input flex-1 min-w-[200px] max-w-md"
              />
              <button type="submit" disabled={searching} className="dashboard-btn-primary flex items-center gap-2 disabled:opacity-50">
                <HiSearch className="text-lg" />
                {searching ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>
          </div>

          {providers.length > 0 && (
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-4">Résultats ({providers.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dashboard-border">
                      <th className="text-left py-3 px-2 dashboard-h3">Nom</th>
                      <th className="text-left py-3 px-2 dashboard-h3">Email</th>
                      <th className="text-left py-3 px-2 dashboard-h3">Téléphone</th>
                      <th className="text-left py-3 px-2 dashboard-h3">Ville</th>
                      <th className="text-right py-3 px-2 dashboard-h3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p.id} className="border-b border-dashboard-border hover:bg-dashboard-hover">
                        <td className="py-3 px-2 dashboard-text text-dashboard-text-main">{p.name}</td>
                        <td className="py-3 px-2 dashboard-text text-dashboard-text-secondary">{p.email || '—'}</td>
                        <td className="py-3 px-2 dashboard-text text-dashboard-text-secondary">{p.phone || '—'}</td>
                        <td className="py-3 px-2 dashboard-text text-dashboard-text-secondary">{p.city || '—'}</td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/admin/fiches/${encodeURIComponent(p.slug)}`}
                              className="inline-flex items-center gap-2 dashboard-btn-primary text-sm py-2 px-4"
                            >
                              <HiPencil className="text-base" />
                              Modifier
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              disabled={deletingSlug === p.slug}
                              className="inline-flex items-center gap-2 border border-dashboard-alert text-dashboard-alert hover:bg-dashboard-alert/10 rounded-lg text-sm py-2 px-4 transition disabled:opacity-50"
                            >
                              <HiTrash className="text-base" />
                              {deletingSlug === p.slug ? 'Suppression...' : 'Supprimer'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {providers.length === 0 && !searching && searchInput.trim() && (
            <div className="dashboard-card border border-dashboard-border text-center py-8">
              <p className="dashboard-text text-dashboard-text-secondary">Aucune fiche trouvée. Modifiez le critère de recherche.</p>
            </div>
          )}
        </div>
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} isOpen onClose={() => setToast(null)} />
      )}
    </div>
  )
}
