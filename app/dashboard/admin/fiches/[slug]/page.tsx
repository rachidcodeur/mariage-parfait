'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { isSuperAdmin } from '@/lib/admin-utils'
import { HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiArrowLeft, HiX, HiHeart, HiFilter, HiPencil } from 'react-icons/hi'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { signOut } from '@/lib/auth'

interface ProviderCategory {
  id: number
  name: string
  slug: string
}

export default function AdminEditFichePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = (params?.slug as string) ?? ''

  const [userName, setUserName] = useState('')
  const [categories, setCategories] = useState<ProviderCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProvider, setLoadingProvider] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    summary: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    street_number: '',
    street_name: '',
    postal_code: '',
    city: '',
    code_departement: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    tiktok_url: '',
    video_url: '',
    google_reviews_url: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/espace-pro')
      return
    }
    if (user) {
      const check = async () => {
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
      check()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (isAdmin && slug) {
      fetchCategories()
      fetchProvider()
    }
  }, [isAdmin, slug])

  const fetchCategories = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('provider_categories')
        .select('*')
        .order('name', { ascending: true })
      if (error) return
      setCategories(data || [])
    } catch {
      // ignore
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProvider = async () => {
    if (!slug) return
    setLoadingProvider(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setToast({ message: 'Session expirée.', type: 'error' })
        setLoadingProvider(false)
        return
      }
      const response = await fetch(`/api/admin/provider-by-slug?slug=${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const result = await response.json()
      if (!response.ok || !result.provider) {
        setToast({ message: result.error || 'Fiche non trouvée.', type: 'error' })
        setTimeout(() => router.push('/dashboard/admin/fiches'), 2000)
        setLoadingProvider(false)
        return
      }
      const provider = result.provider
      setFormData({
        name: provider.name || '',
        category_id: String(provider.category_id) || '',
        summary: provider.summary || '',
        description: provider.description || '',
        email: provider.email || '',
        phone: provider.phone || '',
        website: provider.website || '',
        street_number: provider.street_number || '',
        street_name: provider.street_name || '',
        postal_code: provider.postal_code || '',
        city: provider.city || '',
        code_departement: provider.code_departement || '',
        facebook_url: provider.facebook_url || '',
        instagram_url: provider.instagram_url || '',
        linkedin_url: provider.linkedin_url || '',
        tiktok_url: provider.tiktok_url || '',
        video_url: provider.video_url || '',
        google_reviews_url: provider.google_reviews_url || '',
      })
      if (provider.gallery_images) {
        const arr = Array.isArray(provider.gallery_images)
          ? provider.gallery_images
          : (typeof provider.gallery_images === 'string' ? (() => { try { return JSON.parse(provider.gallery_images) } catch { return [] } })() : [])
        setExistingImages(Array.isArray(arr) ? arr : [])
      }
    } catch (err: any) {
      setToast({ message: err?.message || 'Erreur chargement.', type: 'error' })
    } finally {
      setLoadingProvider(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(f.type) && f.size <= 5 * 1024 * 1024
      )
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => { setSelectedFiles(prev => prev.filter((_, i) => i !== index)) }
  const removeExistingImage = (index: number) => { setExistingImages(prev => prev.filter((_, i) => i !== index)) }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []
    const supabase = getSupabaseClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return []
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `providers/${u.id}/${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`
      const { error } = await supabase.storage.from('images').upload(path, file)
      if (error) continue
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
      urls.push(publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const newUrls = await uploadImages(selectedFiles)
      const allImages = [...existingImages, ...newUrls]

      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setToast({ message: 'Session expirée.', type: 'error' })
        setSaving(false)
        return
      }

      const response = await fetch('/api/admin/update-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          slug,
          ...formData,
          gallery_images: allImages.length > 0 ? allImages : null,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        setToast({ message: result.error || 'Erreur lors de l\'enregistrement.', type: 'error' })
        setSaving(false)
        return
      }

      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/annuaire/prestataire/${slug}`, slug }),
        })
      } catch {
        // ignore
      }

      setToast({ message: 'Fiche modifiée avec succès.', type: 'success' })
      setTimeout(() => router.push('/dashboard/admin/fiches'), 1500)
    } catch (err: any) {
      setToast({ message: err?.message || 'Erreur.', type: 'error' })
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  if (loading || !isAdmin || loadingCategories || loadingProvider) {
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
            <Link href="/dashboard/admin/fiches" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-dashboard-primary/10 text-dashboard-primary">
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
          <p className="text-sm font-semibold text-dashboard-text-main">{userName}</p>
          <p className="dashboard-text-secondary">{user?.email}</p>
          <button type="button" onClick={handleLogout} className="flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-alert transition w-full mt-2">
            <HiLogout className="text-lg" />
            <span className="dashboard-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[240px]">
        <div className="dashboard-content">
          <div className="mb-8">
            <Link href="/dashboard/admin/fiches" className="inline-flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition mb-4">
              <HiArrowLeft className="text-lg" />
              <span className="dashboard-text">Retour à la recherche de fiches</span>
            </Link>
            <h1 className="dashboard-h1">Modifier la fiche (admin)</h1>
            <p className="dashboard-text text-dashboard-text-secondary mt-2">
              Modification en mode super admin : toutes les informations et images peuvent être modifiées.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Informations de base</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block dashboard-h3 mb-2">Nom de l&apos;entreprise <span className="text-dashboard-text-light">(max 100 caractères)</span></label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} maxLength={100} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="category_id" className="block dashboard-h3 mb-2">Catégorie</label>
                  <select id="category_id" name="category_id" value={formData.category_id} onChange={handleInputChange} className="dashboard-input w-full">
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="summary" className="block dashboard-h3 mb-2">Résumé <span className="text-dashboard-text-light">(max 200 caractères)</span></label>
                  <textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} maxLength={200} rows={3} className="dashboard-input w-full" placeholder="Courte description..." />
                  <p className="dashboard-text-secondary text-sm mt-1">{formData.summary.length}/200</p>
                </div>
                <div>
                  <label htmlFor="description" className="block dashboard-h3 mb-2">Description complète</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={8} className="dashboard-input w-full" placeholder="Décrivez vos services..." />
                </div>
              </div>
            </div>

            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Contact</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block dashboard-h3 mb-2">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="phone" className="block dashboard-h3 mb-2">Téléphone</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="dashboard-input w-full" placeholder="+33 6 12 34 56 78" />
                </div>
                <div>
                  <label htmlFor="website" className="block dashboard-h3 mb-2">Site web</label>
                  <input type="url" id="website" name="website" value={formData.website} onChange={handleInputChange} className="dashboard-input w-full" placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Adresse</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street_number" className="block dashboard-h3 mb-2">Numéro de rue</label>
                  <input type="text" id="street_number" name="street_number" value={formData.street_number} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="street_name" className="block dashboard-h3 mb-2">Nom de rue</label>
                  <input type="text" id="street_name" name="street_name" value={formData.street_name} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="postal_code" className="block dashboard-h3 mb-2">Code postal</label>
                  <input type="text" id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="city" className="block dashboard-h3 mb-2">Ville</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="code_departement" className="block dashboard-h3 mb-2">Code département</label>
                  <input type="text" id="code_departement" name="code_departement" value={formData.code_departement} onChange={handleInputChange} className="dashboard-input w-full" placeholder="69" />
                </div>
              </div>
            </div>

            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Réseaux sociaux</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="facebook_url" className="block dashboard-h3 mb-2">Facebook</label>
                  <input type="url" id="facebook_url" name="facebook_url" value={formData.facebook_url} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="instagram_url" className="block dashboard-h3 mb-2">Instagram</label>
                  <input type="url" id="instagram_url" name="instagram_url" value={formData.instagram_url} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="linkedin_url" className="block dashboard-h3 mb-2">LinkedIn</label>
                  <input type="url" id="linkedin_url" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="tiktok_url" className="block dashboard-h3 mb-2">TikTok</label>
                  <input type="url" id="tiktok_url" name="tiktok_url" value={formData.tiktok_url} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
              </div>
            </div>

            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Autres</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="video_url" className="block dashboard-h3 mb-2">URL vidéo</label>
                  <input type="url" id="video_url" name="video_url" value={formData.video_url} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
                <div>
                  <label htmlFor="google_reviews_url" className="block dashboard-h3 mb-2">URL Google Reviews</label>
                  <input type="url" id="google_reviews_url" name="google_reviews_url" value={formData.google_reviews_url} onChange={handleInputChange} className="dashboard-input w-full" />
                </div>
              </div>
            </div>

            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Images</h2>
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h3 className="dashboard-h3 mb-2">Images actuelles</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt={`Image ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-dashboard-border" />
                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="images" className="block dashboard-h3 mb-2">Ajouter des images</label>
                <input type="file" id="images" accept="image/jpeg,image/jpg,image/png,image/gif" multiple onChange={handleFileChange} className="dashboard-input w-full" />
                <p className="dashboard-text-secondary text-sm mt-1">JPG, PNG, GIF. Max 5 Mo par image.</p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="dashboard-h3 mb-2">Nouvelles images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(file)} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-dashboard-border" />
                        <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={saving} className="dashboard-btn-primary">
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <Link href="/dashboard/admin/fiches" className="dashboard-btn-secondary">Annuler</Link>
            </div>
          </form>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} isOpen onClose={() => setToast(null)} duration={5000} />}
    </div>
  )
}
