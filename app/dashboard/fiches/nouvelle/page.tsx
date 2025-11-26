'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { signOut } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase-client'
import { HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiArrowLeft, HiDocument, HiSearch, HiMail, HiPhone, HiLocationMarker, HiCheckCircle, HiClipboardList, HiXCircle, HiSparkles, HiHeart } from 'react-icons/hi'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { normalizeFrenchPhone } from '@/lib/phone-utils'
import type { Provider } from '@/lib/supabase'

interface ProviderCategory {
  id: number
  name: string
  slug: string
}

export default function NouvelleFichePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [categories, setCategories] = useState<ProviderCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  // États pour la vérification de fiche existante
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundProvider, setFoundProvider] = useState<Provider | null>(null)
  const [claimJustification, setClaimJustification] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
      if (user) {
        fetchCategories()
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
  }, [user])


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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setToast({ message: 'Veuillez entrer un nom d\'entreprise, un email ou un numéro de téléphone.', type: 'error' })
      return
    }

    setSearching(true)
    setFoundProvider(null)

    try {
      const supabase = getSupabaseClient()
      const searchTermLower = searchTerm.trim().toLowerCase()
      
      // Recherche par email
      if (searchTermLower.includes('@')) {
        const { data: emailData, error: emailError } = await supabase
          .from('providers')
          .select('*')
          .ilike('email', searchTermLower)
          .limit(1)
          .maybeSingle()

        if (!emailError && emailData) {
          setFoundProvider(emailData as Provider)
          setSearching(false)
          return
        }
      }

      // Recherche par téléphone - normaliser
      // Détecter si c'est un numéro de téléphone
      // - Commence par +33, 33, ou 0 suivi de chiffres
      // - Contient au moins 8 chiffres
      // - Pas d'@ (pour éviter les emails)
      const digitsCount = (searchTerm.match(/\d/g) || []).length
      const startsWithPhonePrefix = /^(\+33|33|0)/.test(searchTerm.trim())
      const isPhoneSearch = (digitsCount >= 8 && !searchTermLower.includes('@')) || 
                           (startsWithPhonePrefix && digitsCount >= 8)
      let normalizedPhone: string | null = null
      let phoneFound = false
      
      if (isPhoneSearch) {
        normalizedPhone = normalizeFrenchPhone(searchTerm)
        console.log('Recherche téléphone - terme:', searchTerm, 'normalisé:', normalizedPhone, 'chiffres:', digitsCount, 'startsWithPrefix:', startsWithPhonePrefix)
        
        if (normalizedPhone && normalizedPhone.length >= 9) {
          // Essayer d'abord une recherche directe avec le numéro normalisé (sans les 0 initiaux aussi)
          const phoneWithoutZero = normalizedPhone.startsWith('0') ? normalizedPhone.substring(1) : normalizedPhone
          const phoneWithPlus33 = '+33' + phoneWithoutZero
          const phoneWith33 = '33' + phoneWithoutZero
          
          // Recherche avec plusieurs variantes
          const searchPatterns = [
            normalizedPhone,
            phoneWithoutZero,
            phoneWithPlus33,
            phoneWith33,
            // Format avec espaces (07 59 17 50 29)
            normalizedPhone.match(/.{1,2}/g)?.join(' ') || normalizedPhone,
            // Format avec tirets
            normalizedPhone.match(/.{1,2}/g)?.join('-') || normalizedPhone,
          ].filter(Boolean)

          console.log('Patterns de recherche:', searchPatterns)

          // Essayer une recherche avec ilike pour chaque pattern
          for (const pattern of searchPatterns) {
            const { data: patternData, error: patternError } = await supabase
              .from('providers')
              .select('*')
              .ilike('phone', `%${pattern}%`)
              .limit(5)

            if (!patternError && patternData && patternData.length > 0) {
              console.log(`Trouvé ${patternData.length} résultats avec pattern:`, pattern)
              // Vérifier chaque résultat en normalisant
              for (const provider of patternData) {
                if (provider.phone) {
                  const providerPhoneNormalized = normalizeFrenchPhone(provider.phone)
                  console.log(`Comparaison: "${providerPhoneNormalized}" === "${normalizedPhone}"`, providerPhoneNormalized === normalizedPhone)
                  if (providerPhoneNormalized === normalizedPhone) {
                    console.log('Fiche trouvée par téléphone:', provider.name, provider.phone)
                    setFoundProvider(provider as Provider)
                    phoneFound = true
                    setSearching(false)
                    return
                  }
                }
              }
            }
          }

          // Si aucune correspondance exacte, récupérer tous les providers et comparer manuellement
          if (!phoneFound) {
            const { data: allProviders, error: allError } = await supabase
              .from('providers')
              .select('*')
              .not('phone', 'is', null)

            if (!allError && allProviders && allProviders.length > 0) {
              console.log(`Recherche manuelle dans ${allProviders.length} providers avec téléphone`)
              for (const provider of allProviders) {
                if (provider.phone) {
                  const providerPhoneNormalized = normalizeFrenchPhone(provider.phone)
                  if (providerPhoneNormalized === normalizedPhone) {
                    console.log('Fiche trouvée par téléphone (recherche manuelle):', provider.name, provider.phone)
                    setFoundProvider(provider as Provider)
                    phoneFound = true
                    setSearching(false)
                    return
                  }
                }
              }
            } else if (allError) {
              console.error('Erreur lors de la récupération des providers:', allError)
            }
          }
        } else {
          console.log('Numéro de téléphone non valide après normalisation:', normalizedPhone, 'longueur:', normalizedPhone?.length)
        }
      }

      // Recherche par nom d'entreprise (seulement si ce n'est pas un email ou un téléphone valide)
      if (!searchTermLower.includes('@') && !phoneFound && (!normalizedPhone || normalizedPhone.length < 9)) {
        const { data: nameData, error: nameError } = await supabase
          .from('providers')
          .select('*')
          .ilike('name', `%${searchTerm.trim()}%`)
          .limit(1)
          .maybeSingle()

        if (!nameError && nameData) {
          setFoundProvider(nameData as Provider)
        }
      }
    } catch (error) {
      console.error('Error searching provider:', error)
      setToast({ message: 'Erreur lors de la recherche.', type: 'error' })
    } finally {
      setSearching(false)
    }
  }

  const handleClaimProvider = async () => {
    if (!foundProvider || !claimJustification.trim()) {
      setToast({ message: 'Veuillez remplir la justification de revendication.', type: 'error' })
      return
    }

    setClaiming(true)

    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setToast({ message: 'Vous devez être connecté.', type: 'error' })
        setClaiming(false)
        return
      }

      // Vérifier d'abord si la table existe en essayant de la lire
      const { data: testData, error: testError } = await supabase
        .from('provider_claims')
        .select('id')
        .limit(1)

      if (testError && testError.code === '42P01') {
        // Table n'existe pas
        console.error('Table provider_claims does not exist')
        setToast({ 
          message: 'La table provider_claims n\'existe pas. Veuillez exécuter le script SQL dans Supabase (supabase/provider_claims.sql).', 
          type: 'error' 
        })
        setClaiming(false)
        return
      }

      // Obtenir le token de session pour l'API
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setToast({ message: 'Erreur: session invalide.', type: 'error' })
        setClaiming(false)
        return
      }

      // Vérifier le statut de la revendication via l'API admin (contourne les RLS)
      const checkResponse = await fetch('/api/admin/check-claim-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          providerId: foundProvider.id,
        }),
      })

      const checkResult = await checkResponse.json()

      if (!checkResponse.ok) {
        console.error('Erreur lors de la vérification:', checkResult.error)
        // Continuer quand même, peut-être que c'est juste un problème temporaire
      } else {
        // Vérifier si la fiche a déjà été revendiquée et approuvée (a un user_id)
        if (checkResult.provider?.user_id) {
          // Vérifier si c'est le même utilisateur
          if (checkResult.provider.user_id === currentUser.id) {
            setToast({ 
              message: 'Cette fiche vous appartient déjà.', 
              type: 'info' 
            })
            setClaiming(false)
            return
          } else {
            // La fiche appartient à quelqu'un d'autre
            setToast({ 
              message: 'Cette fiche a déjà été revendiquée et approuvée par un autre utilisateur. Vous ne pouvez plus la revendiquer.', 
              type: 'error' 
            })
            setClaiming(false)
            return
          }
        }

        // Vérifier s'il existe déjà une revendication en attente pour cette fiche
        if (checkResult.pendingClaims && checkResult.pendingClaims.length > 0) {
          // Vérifier si c'est une revendication de l'utilisateur actuel
          const userClaim = checkResult.pendingClaims.find((claim: any) => claim.user_id === currentUser.id)
          if (userClaim) {
            // L'utilisateur a déjà une revendication en attente
            setToast({ 
              message: 'Vous avez déjà une demande de revendication en attente pour cette fiche.', 
              type: 'info' 
            })
            setClaiming(false)
            return
          } else {
            // Une autre personne a déjà une revendication en attente
            setToast({ 
              message: 'Cette fiche fait déjà l\'objet d\'une demande de revendication en attente par un autre utilisateur. Veuillez attendre que cette demande soit traitée.', 
              type: 'error' 
            })
            setClaiming(false)
            return
          }
        }
      }

      // Créer une demande de revendication
      // La colonne 'justification' existe maintenant dans la table
      const { data: insertData, error } = await supabase
        .from('provider_claims')
        .insert({
          provider_id: foundProvider.id,
          user_id: currentUser.id,
          justification: claimJustification.trim(),
          status: 'pending',
        })
        .select()

      if (error) {
        console.error('Error creating claim:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Message d'erreur plus détaillé
        let errorMessage = 'Erreur lors de la création de la revendication.'
        if (error.message.includes('justification')) {
          errorMessage += ' La colonne "justification" n\'existe pas dans la table. Veuillez vérifier que le script SQL a été exécuté correctement dans Supabase.'
        } else {
          errorMessage += ' ' + error.message
        }
        
        setToast({ message: errorMessage, type: 'error' })
        setClaiming(false)
        return
      }

      console.log('Claim created successfully:', insertData)

      setToast({ message: 'Votre demande de revendication a été envoyée. Un administrateur va l\'examiner.', type: 'success' })
      
      // Réinitialiser et permettre de créer une nouvelle fiche
      setFoundProvider(null)
      setClaimJustification('')
      setSearchTerm('')
      setShowForm(true)
    } catch (error: any) {
      console.error('Error claiming provider:', error)
      setToast({ message: 'Erreur lors de la revendication.', type: 'error' })
    } finally {
      setClaiming(false)
    }
  }

  const handleCreateNew = () => {
    setFoundProvider(null)
    setClaimJustification('')
    setSearchTerm('')
    setShowForm(true)
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    const supabase = getSupabaseClient()
    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!data) {
        return slug
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }
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
        setToast({ message: 'Vous devez être connecté pour créer une fiche.', type: 'error' })
        setSaving(false)
        return
      }


      // Upload des images
      const imageUrls = await uploadImages(selectedFiles)

      // Créer le slug unique
      const baseSlug = generateSlug(formData.name)
      const slug = await ensureUniqueSlug(baseSlug)

      // Construire l'adresse complète
      const addressParts = [
        formData.street_number,
        formData.street_name,
        formData.postal_code,
        formData.city,
      ].filter(Boolean)
      const address = addressParts.length > 0 ? addressParts.join(', ') : null

      // Insérer le provider
      const { data, error } = await supabase
        .from('providers')
        .insert({
          name: formData.name,
          slug: slug,
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
          gallery_images: imageUrls.length > 0 ? imageUrls : null,
          user_id: currentUser.id,
          status: 'pending', // Statut par défaut
          views: 0,
          phone_clicks: 0,
          website_clicks: 0,
          is_featured: false,
          is_boosted: false,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating provider:', error)
        setToast({ message: 'Erreur lors de la création de la fiche. ' + error.message, type: 'error' })
        setSaving(false)
        return
      }

      // Revalider le cache pour que la nouvelle fiche soit visible dans l'annuaire
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
          console.warn('Cache revalidation failed, but creation was successful')
        }
      } catch (revalidateError) {
        console.error('Error revalidating cache:', revalidateError)
        // Ne pas bloquer l'utilisateur si la revalidation échoue
      }

      setToast({ message: 'Fiche créée avec succès !', type: 'success' })
      
      // Rediriger vers la liste des fiches après un court délai
      setTimeout(() => {
        router.push('/dashboard/fiches')
      }, 1500)
    } catch (error: any) {
      console.error('Error creating provider:', error)
      setToast({ message: 'Erreur lors de la création de la fiche.', type: 'error' })
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  if (loading || loadingCategories) {
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
          <Link
            href="/dashboard/revendications"
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
          >
            <HiClipboardList className="text-xl" />
            <span className="dashboard-text">Mes revendications</span>
          </Link>
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

      {/* Main Content */}
      <main className="flex-1 ml-[240px]">
        <div className="dashboard-content px-[200px]">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/fiches"
              className="inline-flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition mb-4"
            >
              <HiArrowLeft className="text-lg" />
              <span className="dashboard-text">Retour à mes fiches</span>
            </Link>
            <h1 className="dashboard-h1">Créer une nouvelle fiche</h1>
          </div>

              {/* Section de vérification de fiche existante - Toujours affichée en premier */}
              {!showForm && (
            <>
              <div className="dashboard-card border border-dashboard-border mb-6 bg-blue-50 border-blue-200">
                <h2 className="dashboard-h2 mb-2 text-blue-700">Vérifier si une fiche existe déjà</h2>
                <p className="dashboard-text text-blue-600 mb-4">
                  Avant de créer une nouvelle fiche, vérifiez si votre entreprise n'est pas déjà référencée.
                </p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="dashboard-input flex-1"
                    placeholder="Nom de l'entreprise, email ou numéro de téléphone"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="bg-dashboard-primary hover:bg-dashboard-primary/90 !text-white px-6 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <HiSearch className="text-lg" />
                    {searching ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </div>

              {/* Message si aucune recherche n'a été effectuée */}
              {!foundProvider && !searching && searchTerm.trim() === '' && (
                <div className="dashboard-card border border-dashboard-border mb-6">
                  <p className="dashboard-text text-dashboard-text-secondary text-center mb-4">
                    Recherchez une fiche existante ou créez une nouvelle fiche.
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={handleCreateNew}
                      className="dashboard-btn-primary flex items-center gap-2"
                    >
                      <HiDocument className="text-lg" />
                      Créer une nouvelle fiche
                    </button>
                  </div>
                </div>
              )}

              {/* Message si aucune fiche n'a été trouvée après recherche */}
              {!foundProvider && !searching && searchTerm.trim() !== '' && (
                <div className="dashboard-card border border-dashboard-border mb-6 bg-yellow-50 border-yellow-200">
                  <p className="dashboard-text text-yellow-700 text-center mb-4">
                    Aucune fiche trouvée pour "{searchTerm}".
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={handleCreateNew}
                      className="dashboard-btn-primary flex items-center gap-2"
                    >
                      <HiDocument className="text-lg" />
                      Créer une nouvelle fiche
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Fiche trouvée */}
          {foundProvider && !showForm && (
            <div className="dashboard-card border border-dashboard-border mb-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <HiCheckCircle className="text-green-600 text-2xl" />
                <h2 className="dashboard-h2 text-green-700">Fiche trouvée !</h2>
              </div>

              {/* Carte du provider trouvé */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-dashboard-bg-secondary rounded-lg flex-shrink-0 overflow-hidden border border-dashboard-border">
                    {foundProvider.gallery_images && foundProvider.gallery_images.length > 0 ? (
                      <img
                        src={foundProvider.gallery_images[0]}
                        alt={foundProvider.name}
                        className="w-full h-full object-cover"
                      />
                    ) : foundProvider.logo_url ? (
                      <img
                        src={foundProvider.logo_url}
                        alt={foundProvider.name}
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
                    <h3 className="dashboard-h2 mb-3">{foundProvider.name}</h3>
                    <div className="space-y-2">
                      {foundProvider.email && (
                        <div className="flex items-center gap-2 dashboard-text text-dashboard-text-main">
                          <HiMail className="text-dashboard-text-light" />
                          <span>{foundProvider.email}</span>
                        </div>
                      )}
                      {foundProvider.phone && (
                        <div className="flex items-center gap-2 dashboard-text text-dashboard-text-main">
                          <HiPhone className="text-dashboard-text-light" />
                          <span>{foundProvider.phone}</span>
                        </div>
                      )}
                      {foundProvider.city && (
                        <div className="flex items-center gap-2 dashboard-text text-dashboard-text-main">
                          <HiLocationMarker className="text-dashboard-text-light" />
                          <span>{foundProvider.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Justification de revendication */}
              <div className="mb-4">
                <label htmlFor="claimJustification" className="block dashboard-h3 mb-2">
                  Justification de la récupération *
                </label>
                <textarea
                  id="claimJustification"
                  value={claimJustification}
                  onChange={(e) => setClaimJustification(e.target.value)}
                  className="dashboard-input w-full"
                  placeholder="Expliquez pourquoi vous souhaitez récupérer cette fiche (ex: c'est mon entreprise, j'ai créé cette fiche par erreur, etc.)"
                  rows={4}
                  required
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <button
                  onClick={handleClaimProvider}
                  disabled={claiming || !claimJustification.trim()}
                  className="bg-dashboard-success hover:bg-dashboard-success/90 !text-white px-6 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claiming ? 'Envoi...' : 'Récupérer la fiche'}
                </button>
                <button
                  onClick={handleCreateNew}
                  className="dashboard-btn-secondary"
                >
                  Créer une nouvelle fiche
                </button>
              </div>
            </div>
          )}

              {/* Formulaire de création - affiché seulement si showForm est true */}
              {showForm && (
                <>
                  {/* Information */}
                  <div className="dashboard-card border border-dashboard-border mb-6 bg-blue-50 border-blue-200">
                    <p className="dashboard-text text-blue-700">
                      Vous pouvez créer autant de fiches que vous souhaitez gratuitement. Pour mettre une fiche en avant, rendez-vous dans la section "Mise en avant" de votre dashboard.
                    </p>
                  </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Informations de base</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block dashboard-h3 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="Nom de votre entreprise"
                    required
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
                    className="dashboard-input w-full"
                    required
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
                    Résumé *
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="Courte description de votre entreprise (max 200 caractères)"
                    rows={3}
                    maxLength={200}
                    required
                  />
                  <p className="dashboard-text-secondary mt-1 text-sm">
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
                    className="dashboard-input w-full"
                    placeholder="Description détaillée de vos services"
                    rows={6}
                    required
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
                    className="dashboard-input w-full"
                    placeholder="votre@email.com"
                    required
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
                    placeholder="01 23 45 67 89"
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
                    placeholder="https://votre-site.com"
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
                    Numéro
                  </label>
                  <input
                    type="text"
                    id="street_number"
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="123"
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
                    placeholder="Rue de la Paix"
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
                    placeholder="75001"
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
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label htmlFor="code_departement" className="block dashboard-h3 mb-2">
                    Département
                  </label>
                  <input
                    type="text"
                    id="code_departement"
                    name="code_departement"
                    value={formData.code_departement}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="75"
                  />
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Réseaux sociaux</h2>
              
              <div className="space-y-4">
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
                    placeholder="https://facebook.com/votre-page"
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
                    placeholder="https://instagram.com/votre-compte"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin_url" className="block dashboard-h3 mb-2">
                    Linkedin
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://linkedin.com/company/votre-entreprise"
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
                    placeholder="https://tiktok.com/@votre-compte"
                  />
                </div>
              </div>
            </div>

            {/* Liens supplémentaires */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Liens supplémentaires</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="video_url" className="block dashboard-h3 mb-2">
                    Vidéo de présentation
                  </label>
                  <input
                    type="url"
                    id="video_url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label htmlFor="google_reviews_url" className="block dashboard-h3 mb-2">
                    Avis Google
                  </label>
                  <input
                    type="url"
                    id="google_reviews_url"
                    name="google_reviews_url"
                    value={formData.google_reviews_url}
                    onChange={handleInputChange}
                    className="dashboard-input w-full"
                    placeholder="https://g.page/votre-entreprise/review"
                  />
                </div>
              </div>
            </div>

            {/* Galerie d'images */}
            <div className="dashboard-card border border-dashboard-border">
              <h2 className="dashboard-h2 mb-6">Galerie d'images</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block dashboard-h3 mb-2">Ajouter des images</label>
                  <input
                    type="file"
                    id="images"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="dashboard-btn-secondary inline-block cursor-pointer"
                  >
                    Parcourir...
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dashboard-bg-secondary rounded">
                        <span className="dashboard-text text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-dashboard-alert hover:text-dashboard-alert/80 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFiles.length === 0 && (
                  <p className="dashboard-text-secondary text-sm">Aucun fichier sélectionné.</p>
                )}

                <p className="dashboard-text-secondary text-sm">
                  Formats acceptés : JPG, PNG, GIF. Taille maximale : 5MB par image.
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard/fiches"
                className="dashboard-btn-secondary"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="dashboard-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiDocument className="text-lg" />
                {saving ? 'Création...' : 'Créer la fiche'}
              </button>
            </div>
          </form>
            </>
          )}
        </div>
      </main>

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

