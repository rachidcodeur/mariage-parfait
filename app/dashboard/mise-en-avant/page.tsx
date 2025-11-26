'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { signOut } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase-client'
import { HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiArrowLeft, HiStar, HiCheckCircle, HiXCircle, HiSparkles, HiHeart } from 'react-icons/hi'
import Link from 'next/link'
import Toast from '@/components/Toast'
import NotificationBell from '@/components/NotificationBell'
import ConfirmDialog from '@/components/ConfirmDialog'
import { loadStripe } from '@stripe/stripe-js'
import type { Provider } from '@/lib/supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface BoostPlan {
  id: string
  name: string
  price: number
  maxListings: number
  priceId: string // ID du prix Stripe
}

export default function MiseEnAvantPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userName, setUserName] = useState('')
  const [providers, setProviders] = useState<Provider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [processing, setProcessing] = useState(false)
  const [activePlan, setActivePlan] = useState<BoostPlan | null>(null)
  const [boostedCount, setBoostedCount] = useState(0)
  const [boostPlans, setBoostPlans] = useState<BoostPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  // Définir fetchActivePlan avant le useEffect qui l'utilise
  const fetchActivePlan = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/stripe/get-boost-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()
      
      // Stocker les informations de l'abonnement
      setSubscription(result.subscription || null)
      
      if (result.subscription && result.isActive) {
        // Récupérer les plans pour trouver celui correspondant au maxListings
        const plansResponse = await fetch('/api/stripe/get-boost-plans')
        const plansResult = await plansResponse.json()
        if (plansResult.plans) {
          // Utiliser max_boosted_listings de la subscription pour trouver le plan correspondant
          const maxListings = result.maxListings || result.subscription.max_boosted_listings
          const plan = plansResult.plans.find((p: BoostPlan) => p.maxListings === maxListings)
          if (plan) {
            setActivePlan(plan)
          } else if (maxListings) {
            // Si aucun plan ne correspond exactement, créer un plan dynamique
            setActivePlan({
              id: 'boost-custom',
              name: `${maxListings} fiche${maxListings > 1 ? 's' : ''}`,
              price: 0, // Prix inconnu
              maxListings: maxListings,
              priceId: result.subscription.stripe_price_id || '',
            })
          }
        }
      } else {
        setActivePlan(null)
      }
    } catch (error) {
      console.error('Error fetching active plan:', error)
      setActivePlan(null)
    }
  }, [user])

  // Définir syncBoostSubscription avant le useEffect qui l'utilise
  const syncBoostSubscription = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()
      if (result.success) {
        // Recharger le plan actif après synchronisation
        await fetchActivePlan()
        setToast({ message: 'Abonnement synchronisé avec succès !', type: 'success' })
      } else {
        setToast({ message: result.error || 'Erreur lors de la synchronisation.', type: 'error' })
      }
    } catch (error) {
      console.error('Error syncing subscription:', error)
      setToast({ message: 'Erreur lors de la synchronisation.', type: 'error' })
    }
  }, [user, fetchActivePlan])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/espace-pro')
      return
    }

    if (user) {
      fetchBoostPlans()
      fetchProviders()
      fetchActivePlan()
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

    // Vérifier les paramètres d'URL pour les messages de succès/annulation
    const successParam = searchParams?.get('success')
    const canceledParam = searchParams?.get('canceled')
    
    if (successParam === 'true' && user) {
      setToast({ message: 'Votre abonnement de mise en avant a été activé avec succès ! Synchronisation en cours...', type: 'success' })
      
      // Synchroniser immédiatement, puis vérifier et réessayer si nécessaire
      const syncAndCheck = async (attempt = 1, maxAttempts = 3) => {
        console.log(`[Sync] Tentative ${attempt}/${maxAttempts}`)
        
        // Synchroniser d'abord
        await syncBoostSubscription()
        
        // Attendre un peu pour laisser la synchronisation se terminer
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Vérifier l'état actuel
        const checkResponse = await fetch('/api/stripe/get-boost-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        })
        const checkResult = await checkResponse.json()
        
        console.log('[Sync] Résultat de la vérification:', checkResult)
        
        if (checkResult.subscription && checkResult.isActive) {
          // Recharger le plan actif
          await fetchActivePlan()
          setToast({ message: 'Votre abonnement est maintenant actif !', type: 'success' })
        } else if (attempt < maxAttempts) {
          // Réessayer après un délai plus long
          console.log(`[Sync] Abonnement non actif, nouvelle tentative dans 3 secondes...`)
          setTimeout(() => syncAndCheck(attempt + 1, maxAttempts), 3000)
        } else {
          // Dernière tentative échouée
          setToast({ 
            message: 'L\'abonnement a été créé mais n\'est pas encore visible. Veuillez actualiser la page dans quelques instants.', 
            type: 'info' 
          })
          // Recharger quand même le plan actif au cas où
          await fetchActivePlan()
        }
      }
      
      // Démarrer la synchronisation après un court délai
      setTimeout(() => syncAndCheck(), 1000)
    }
    if (canceledParam === 'true') {
      setToast({ message: 'Le paiement a été annulé.', type: 'info' })
    }
  }, [user, authLoading, router, searchParams, syncBoostSubscription, fetchActivePlan])

  const fetchProviders = async () => {
    if (!user) return

    setLoadingProviders(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching providers:', error)
        return
      }

      setProviders(data || [])
      const boosted = (data || []).filter(p => p.is_boosted).length
      setBoostedCount(boosted)
      
      // Recharger le plan actif pour s'assurer que les limites sont à jour
      if (user) {
        fetchActivePlan()
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoadingProviders(false)
    }
  }

  const fetchBoostPlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await fetch('/api/stripe/get-boost-plans')
      const result = await response.json()
      if (result.plans) {
        setBoostPlans(result.plans)
      }
    } catch (error) {
      console.error('Error fetching boost plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleSubscribe = async (plan: BoostPlan) => {
    if (!user) {
      setToast({ message: 'Vous devez être connecté.', type: 'error' })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/stripe/create-boost-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          priceId: plan.priceId,
          maxListings: plan.maxListings, // Envoyer le nombre maximum de fiches
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setToast({ message: result.error || 'Erreur lors de la création de la session de paiement.', type: 'error' })
        setProcessing(false)
        return
      }

      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise
      if (stripe && result.sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId: result.sessionId })
        if (error) {
          setToast({ message: error.message || 'Erreur lors de la redirection vers le paiement.', type: 'error' })
          setProcessing(false)
        }
      }
    } catch (error: any) {
      console.error('Error subscribing:', error)
      setToast({ message: 'Erreur lors de l\'abonnement.', type: 'error' })
      setProcessing(false)
    }
  }

  const handleToggleBoost = async (providerId: number, currentBoosted: boolean) => {
    if (!user) return

    // Si on désactive, pas besoin de vérifier la limite
    if (currentBoosted) {
      // Pas de vérification nécessaire pour désactiver
    } else {
      // Vérifier qu'un plan actif existe
      if (!activePlan) {
        setToast({ 
          message: 'Vous devez d\'abord souscrire à un plan de mise en avant.', 
          type: 'error' 
        })
        return
      }

      // Vérifier la limite du plan AVANT d'activer
      if (boostedCount >= activePlan.maxListings) {
        setToast({ 
          message: `Vous avez atteint la limite de ${activePlan.maxListings} fiche${activePlan.maxListings > 1 ? 's' : ''} boostée${activePlan.maxListings > 1 ? 's' : ''} avec votre plan actuel.`, 
          type: 'error' 
        })
        return
      }
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('providers')
        .update({ is_boosted: !currentBoosted })
        .eq('id', providerId)

      if (error) {
        console.error('Error toggling boost:', error)
        setToast({ message: 'Erreur lors de la mise à jour.', type: 'error' })
        return
      }

      setToast({ 
        message: currentBoosted 
          ? 'Mise en avant désactivée.' 
          : 'Mise en avant activée !', 
        type: 'success' 
      })
      fetchProviders()
    } catch (error) {
      console.error('Error toggling boost:', error)
      setToast({ message: 'Erreur lors de la mise à jour.', type: 'error' })
    }
  }

  const handleCancelSubscription = async () => {
    if (!user) return

    setCanceling(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        setToast({ message: result.error || 'Erreur lors de l\'annulation.', type: 'error' })
        setCanceling(false)
        return
      }

      setToast({ 
        message: 'Votre abonnement sera annulé à la fin de la période en cours. Vous pourrez continuer à utiliser vos fiches boostées jusqu\'à cette date.', 
        type: 'success' 
      })
      setShowCancelConfirm(false)
      await fetchActivePlan()
    } catch (error: any) {
      console.error('Error canceling subscription:', error)
      setToast({ message: 'Erreur lors de l\'annulation.', type: 'error' })
    } finally {
      setCanceling(false)
    }
  }

  const handleResumeSubscription = async () => {
    if (!user) return

    setResuming(true)
    try {
      const response = await fetch('/api/stripe/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        setToast({ message: result.error || 'Erreur lors de la reprise de l\'abonnement.', type: 'error' })
        setResuming(false)
        return
      }

      setToast({ message: 'Abonnement repris avec succès !', type: 'success' })
      
      // Recharger les données
      await fetchActivePlan()
    } catch (error) {
      console.error('Error resuming subscription:', error)
      setToast({ message: 'Erreur lors de la reprise de l\'abonnement.', type: 'error' })
    } finally {
      setResuming(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  if (authLoading || loadingProviders) {
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
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
          >
            <HiDocumentText className="text-xl" />
            <span className="dashboard-text">Mes fiches</span>
          </Link>
          <Link
            href="/dashboard/mise-en-avant"
            className="flex items-center space-x-3 px-4 py-3 bg-dashboard-hover text-dashboard-primary rounded-lg font-semibold"
          >
            <HiSparkles className="text-xl" />
            <span className="dashboard-text font-semibold">Mise en avant</span>
          </Link>
          <Link
            href="/dashboard/revendications"
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
          >
            <HiCheckCircle className="text-xl" />
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="dashboard-h1">Mise en avant</h1>
                <p className="dashboard-text text-dashboard-text-secondary mt-2">
                  Boostez vos fiches pour qu'elles apparaissent dans la section premium
                </p>
              </div>
              <NotificationBell />
            </div>
          </div>

          {/* Plan actif */}
          {activePlan && subscription && (
            <div className={`dashboard-card border border-dashboard-border mb-6 ${
              subscription.cancel_at_period_end 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className={`dashboard-h2 mb-2 ${
                    subscription.cancel_at_period_end 
                      ? 'text-yellow-700' 
                      : 'text-green-700'
                  }`}>
                    Plan actif
                  </h2>
                  <p className={`dashboard-text ${
                    subscription.cancel_at_period_end 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                    {activePlan.name} - {activePlan.price}€/mois
                  </p>
                  <p className="dashboard-text-secondary text-sm mt-1">
                    {boostedCount} / {activePlan.maxListings} fiches boostées
                  </p>
                  {subscription.cancel_at_period_end && subscription.current_period_end && (
                    <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <p className="dashboard-text text-yellow-800 font-semibold mb-1">
                        ⚠️ Abonnement annulé
                      </p>
                      <p className="dashboard-text text-yellow-700 text-sm">
                        Vos fiches resteront en avant jusqu'au{' '}
                        <span className="font-semibold">
                          {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        . Après cette date, elles seront automatiquement retirées de la mise en avant.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {!subscription.cancel_at_period_end && (
                    <>
                      <div className="flex items-center gap-2">
                        <HiCheckCircle className="text-green-600 text-2xl" />
                        <span className="dashboard-text font-semibold text-green-700">Actif</span>
                      </div>
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={canceling}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <HiXCircle className="text-lg" />
                        Annuler l'abonnement
                      </button>
                    </>
                  )}
                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <HiXCircle className="text-yellow-600 text-2xl" />
                        <span className="dashboard-text font-semibold text-yellow-700">Annulé</span>
                      </div>
                      <button
                        onClick={handleResumeSubscription}
                        disabled={resuming}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{ color: 'white' }}
                      >
                        {resuming ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Reprise...</span>
                          </>
                        ) : (
                          <>
                            <HiCheckCircle className="text-lg" />
                            <span>Reprendre l'abonnement</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Plans disponibles */}
          {/* Afficher les plans si pas d'abonnement actif OU si l'abonnement est annulé */}
          {(!activePlan || (subscription && subscription.cancel_at_period_end)) && !loadingPlans && (
            <div className="dashboard-card border border-dashboard-border mb-6">
              <h2 className="dashboard-h2 mb-4">
                {subscription && subscription.cancel_at_period_end 
                  ? 'Choisissez un nouveau plan ou reprenez votre abonnement actuel' 
                  : 'Choisissez votre plan de mise en avant'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {boostPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-dashboard-border rounded-lg p-6 hover:border-primary-500 transition"
                  >
                    <h3 className="!text-[22px] font-semibold mb-2" style={{ fontSize: '22px' }}>{plan.name}</h3>
                    <div className="mb-4">
                      <span className="!text-[18px] font-semibold" style={{ fontSize: '18px' }}>{plan.price}€</span>
                      <span className="dashboard-text-secondary">/mois</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 dashboard-text-secondary !text-[15px]" style={{ fontSize: '15px' }}>
                        <HiCheckCircle className="text-green-600" />
                        <span>Jusqu'à {plan.maxListings} fiches boostées</span>
                      </li>
                      <li className="flex items-center gap-2 dashboard-text-secondary !text-[15px]" style={{ fontSize: '15px' }}>
                        <HiCheckCircle className="text-green-600" />
                        <span>Apparition dans la section premium</span>
                      </li>
                      <li className="flex items-center gap-2 dashboard-text-secondary !text-[15px]" style={{ fontSize: '15px' }}>
                        <HiCheckCircle className="text-green-600" />
                        <span>Meilleure visibilité</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={processing}
                      className="dashboard-btn-primary w-full"
                    >
                      {processing ? 'Redirection...' : 'Choisir ce plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des fiches */}
          <div className="dashboard-card border border-dashboard-border">
            <h2 className="dashboard-h2 mb-6">Vos fiches</h2>
            {loadingProviders ? (
              <div className="text-center py-12">
                <p className="dashboard-text text-dashboard-text-secondary">Chargement...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12">
                <p className="dashboard-text text-dashboard-text-secondary mb-4">
                  Vous n'avez pas encore de fiche.
                </p>
                <Link
                  href="/dashboard/fiches/nouvelle"
                  className="dashboard-btn-primary inline-flex items-center gap-2"
                >
                  Créer ma première fiche
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border border-dashboard-border rounded-lg hover:bg-dashboard-hover transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Image */}
                      <div className="w-16 h-16 bg-dashboard-bg-secondary rounded-lg flex-shrink-0 overflow-hidden border border-dashboard-border">
                        {provider.gallery_images && provider.gallery_images.length > 0 ? (
                          <img
                            src={Array.isArray(provider.gallery_images) ? provider.gallery_images[0] : JSON.parse(provider.gallery_images as any)[0]}
                            alt={provider.name}
                            className="w-full h-full object-cover"
                          />
                        ) : provider.logo_url ? (
                          <img
                            src={provider.logo_url}
                            alt={provider.name}
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
                        <h3 className="dashboard-h2 mb-1">{provider.name}</h3>
                        {provider.city && (
                          <p className="dashboard-text-secondary text-sm">📍 {provider.city}</p>
                        )}
                      </div>

                      {/* Statut boost */}
                      <div className="flex items-center gap-4">
                        {provider.is_boosted ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold">
                            <HiStar className="text-lg" />
                            En avant
                          </span>
                        ) : (
                          <span className="text-dashboard-text-secondary text-sm">Non boostée</span>
                        )}

                        {/* Toggle boost */}
                        <button
                          onClick={() => handleToggleBoost(provider.id, provider.is_boosted || false)}
                          disabled={!activePlan && !provider.is_boosted}
                          className={`px-4 py-2 rounded-lg dashboard-text font-semibold transition ${
                            provider.is_boosted
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-primary-500 !text-white hover:bg-primary-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {provider.is_boosted ? (
                            <>
                              <HiXCircle className="inline mr-1" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <HiSparkles className="inline mr-1 !text-white" />
                              <span className="!text-white">Mettre en avant</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de confirmation d'annulation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Annuler votre abonnement ?"
        message={
          <div className="space-y-4">
            <p className="dashboard-text text-dashboard-text-main">
              Êtes-vous sûr de vouloir annuler votre abonnement de mise en avant ?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <p className="dashboard-text font-semibold text-yellow-800 mb-2">
                ⚠️ Avant de continuer, considérez ces avantages :
              </p>
              <ul className="space-y-1 dashboard-text text-yellow-700 text-sm list-disc list-inside">
                <li>Vos fiches apparaissent en premier dans les résultats de recherche</li>
                <li>Meilleure visibilité = plus de clients potentiels</li>
                <li>Section premium dédiée pour maximiser votre exposition</li>
                <li>Investissement rentable pour développer votre activité</li>
              </ul>
            </div>
            <p className="dashboard-text text-dashboard-text-main">
              Si vous annulez, votre abonnement restera actif jusqu'à la fin de la période en cours. 
              Vous perdrez ensuite tous ces avantages et vos fiches ne seront plus mises en avant.
            </p>
            <p className="dashboard-text font-semibold text-dashboard-text-main">
              Voulez-vous vraiment continuer ?
            </p>
          </div>
        }
        confirmText="Oui, annuler mon abonnement"
        cancelText="Non, garder mon abonnement"
        onConfirm={handleCancelSubscription}
        onCancel={() => setShowCancelConfirm(false)}
      />

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

