'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { signOut } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase-client'
import { HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiArrowLeft, HiX, HiHeart } from 'react-icons/hi'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { normalizeFrenchPhone } from '@/lib/phone-utils'
import type { Provider } from '@/lib/supabase'

interface ProviderCategory {
  id: number
  name: string
  slug: string
}

export default function ModifierFichePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  
  const [userName, setUserName] = useState('')
  const [categories, setCategories] = useState<ProviderCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProvider, setLoadingProvider] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  
  // États du formulaire
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
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && slug) {
      fetchCategories()
      fetchProvider()
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
    }
  }, [user, slug])

  const fetchCategories = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('provider_categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProvider = async () => {
    if (!slug || !user) return

    setLoadingProvider(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('slug', slug)
        .eq('user_id', currentUser.id)
        .single()

      if (error || !provider) {
        setToast({ message: 'Fiche non trouvée ou vous n\'avez pas les droits pour la modifier.', type: 'error' })
        setTimeout(() => {
          router.push('/dashboard/fiches')
        }, 2000)
        return
      }

      // Préremplir le formulaire
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

      // Récupérer les images existantes
      if (provider.gallery_images) {
        if (Array.isArray(provider.gallery_images)) {
          setExistingImages(provider.gallery_images)
        } else if (typeof provider.gallery_images === 'string') {
          try {
            const parsed = JSON.parse(provider.gallery_images)
            setExistingImages(Array.isArray(parsed) ? parsed : [])
          } catch {
            setExistingImages([])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching provider:', error)
      setToast({ message: 'Erreur lors du chargement de la fiche.', type: 'error' })
    } finally {
      setLoadingProvider(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      // Vérifier la taille et le type des fichiers
      const validFiles = files.filter(file => {
        const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)
        const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
        return isValidType && isValidSize
      })
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    const supabase = getSupabaseClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return []

    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUser.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `providers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.category_id || !formData.summary || !formData.description || !formData.email) {
      setToast({ message: 'Veuillez remplir tous les champs obligatoires.', type: 'error' })
      return
    }

    if (formData.summary.length > 200) {
      setToast({ message: 'Le résumé ne doit pas dépasser 200 caractères.', type: 'error' })
      return
    }

    setSaving(true)

    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setToast({ message: 'Vous devez être connecté pour modifier une fiche.', type: 'error' })
        setSaving(false)
        return
      }

      // Upload des nouvelles images
      const newImageUrls = await uploadImages(selectedFiles)
      
      // Combiner les images existantes (non supprimées) avec les nouvelles
      const allImages = [...existingImages, ...newImageUrls]

      // Construire l'adresse complète
      const addressParts = [
        formData.street_number,
        formData.street_name,
        formData.postal_code,
        formData.city,
      ].filter(Boolean)
      const address = addressParts.length > 0 ? addressParts.join(', ') : null

      // Mettre à jour le provider
      const { error } = await supabase
        .from('providers')
        .update({
          name: formData.name,
          category_id: parseInt(formData.category_id),
          summary: formData.summary,
          description: formData.description,
          email: formData.email,
          phone: formData.phone || null,
          website: formData.website || null,
          street_number: formData.street_number || null,
          street_name: formData.street_name || null,
          postal_code: formData.postal_code || null,
          city: formData.city || null,
          code_departement: formData.code_departement || null,
          address: address,
          facebook_url: formData.facebook_url || null,
          instagram_url: formData.instagram_url || null,
          linkedin_url: formData.linkedin_url || null,
          tiktok_url: formData.tiktok_url || null,
          video_url: formData.video_url || null,
          google_reviews_url: formData.google_reviews_url || null,
          gallery_images: allImages.length > 0 ? allImages : null,
        })
        .eq('slug', slug)
        .eq('user_id', currentUser.id)

      if (error) {
        console.error('Error updating provider:', error)
        setToast({ message: 'Erreur lors de la modification de la fiche. ' + error.message, type: 'error' })
        setSaving(false)
        return
      }

      // Revalider le cache pour que les changements soient visibles dans l'annuaire
      try {
        const revalidateResponse = await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: `/annuaire/prestataire/${slug}`,
            slug: slug,
          }),
        })

        if (!revalidateResponse.ok) {
          console.warn('Cache revalidation failed, but update was successful')
        }
      } catch (revalidateError) {
        console.error('Error revalidating cache:', revalidateError)
        // Ne pas bloquer l'utilisateur si la revalidation échoue
      }

      setToast({ message: 'Fiche modifiée avec succès !', type: 'success' })
      
      // Rediriger vers la liste des fiches après un court délai
      setTimeout(() => {
        router.push('/dashboard/fiches')
      }, 1500)
    } catch (error: any) {
      console.error('Error updating provider:', error)
      setToast({ message: 'Erreur lors de la modification de la fiche.', type: 'error' })
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  if (loading || loadingCategories || loadingProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-secondary">
        <p className="text-dashboard-text-secondary">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dashboard-bg-secondary flex">
      {/* Sidebar */}
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
            className="flex items-center space-x-3 px-4 py-3 bg-dashboard-hover text-dashboard-primary rounded-lg font-semibold"
          >
            <HiDocumentText className="text-xl" />
            <span className="dashboard-text font-semibold">Mes fiches</span>
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

      {/* Main Content */}
      <main className="flex-1 ml-[240px]">
        <div className="dashboard-content">
          <div className="mb-8">
            <Link
              href="/dashboard/fiches"
              className="inline-flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition mb-4"
            >
              <HiArrowLeft className="text-lg" />
              <span className="dashboard-text">Retour à mes fiches</span>
            </Link>
            <h1 className="dashboard-h1">Modifier une fiche</h1>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Informations de base</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block dashboard-h3 mb-2">
                    Nom de l'entreprise * <span className="text-dashboard-text-light">(max 100 caractères)</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                    className="dashboard-input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="category_id" className="block dashboard-h3 mb-2">
                    Catégorie *
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="dashboard-input w-full"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="summary" className="block dashboard-h3 mb-2">
                    Résumé * <span className="text-dashboard-text-light">(max 200 caractères)</span>
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    maxLength={200}
                    rows={3}
                    required
                    className="dashboard-input w-full"
                    placeholder="Une courte description de votre entreprise..."
                  />
                  <p className="dashboard-text-secondary text-sm mt-1">
                    {formData.summary.length}/200 caractères
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block dashboard-h3 mb-2">
                    Description complète *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={8}
                    required
                    className="dashboard-input w-full"
                    placeholder="Décrivez en détail vos services, votre expérience, vos tarifs..."
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Contact</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block dashboard-h3 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="dashboard-input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block dashboard-h3 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block dashboard-h3 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://www.exemple.com"
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Adresse</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street_number" className="block dashboard-h3 mb-2">
                    Numéro de rue
                  </label>
                  <input
                    type="text"
                    id="street_number"
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="street_name" className="block dashboard-h3 mb-2">
                    Nom de rue
                  </label>
                  <input
                    type="text"
                    id="street_name"
                    name="street_name"
                    value={formData.street_name}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="postal_code" className="block dashboard-h3 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block dashboard-h3 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="code_departement" className="block dashboard-h3 mb-2">
                    Code département
                  </label>
                  <input
                    type="text"
                    id="code_departement"
                    name="code_departement"
                    value={formData.code_departement}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="69"
                  />
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Réseaux sociaux</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="facebook_url" className="block dashboard-h3 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook_url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://www.facebook.com/..."
                  />
                </div>

                <div>
                  <label htmlFor="instagram_url" className="block dashboard-h3 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram_url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://www.instagram.com/..."
                  />
                </div>

                <div>
                  <label htmlFor="linkedin_url" className="block dashboard-h3 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://www.linkedin.com/..."
                  />
                </div>

                <div>
                  <label htmlFor="tiktok_url" className="block dashboard-h3 mb-2">
                    TikTok
                  </label>
                  <input
                    type="url"
                    id="tiktok_url"
                    name="tiktok_url"
                    value={formData.tiktok_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://www.tiktok.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Autres */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Autres informations</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="video_url" className="block dashboard-h3 mb-2">
                    URL vidéo (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    id="video_url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label htmlFor="google_reviews_url" className="block dashboard-h3 mb-2">
                    URL Google Reviews
                  </label>
                  <input
                    type="url"
                    id="google_reviews_url"
                    name="google_reviews_url"
                    value={formData.google_reviews_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://www.google.com/maps/place/..."
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Images</h2>
              
              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h3 className="dashboard-h3 mb-2">Images actuelles</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-dashboard-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles images */}
              <div>
                <label htmlFor="images" className="block dashboard-h3 mb-2">
                  Ajouter de nouvelles images
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  multiple
                  onChange={handleFileChange}
                  className="dashboard-input w-full"
                />
                <p className="dashboard-text-secondary text-sm mt-1">
                  Formats acceptés : JPG, PNG, GIF. Taille max : 5MB par image.
                </p>
              </div>

              {/* Aperçu des nouvelles images */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="dashboard-h3 mb-2">Nouvelles images à ajouter</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-dashboard-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="dashboard-btn-primary"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <Link
                href="/dashboard/fiches"
                className="dashboard-btn-secondary"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={!!toast}
          onClose={() => setToast(null)}
          duration={5000}
        />
      )}
    </div>
  )
}

