'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { HiCheckCircle, HiXCircle, HiClock, HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiArrowLeft, HiRefresh, HiHeart } from 'react-icons/hi'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { signOut } from '@/lib/auth'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function AbonnementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
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

      loadSubscription()
    }

    // Vérifier les paramètres d'URL pour les messages de succès/annulation
    if (searchParams?.get('success') === 'true') {
      setToast({ message: 'Votre abonnement a été activé avec succès ! Synchronisation en cours...', type: 'success' })
      // Attendre un peu pour laisser le webhook se déclencher, puis synchroniser manuellement si nécessaire
      setTimeout(async () => {
        await loadSubscription()
        // Si toujours pas d'abonnement après 2 secondes, synchroniser manuellement
        setTimeout(async () => {
          // Vérifier à nouveau l'état après le chargement
          const checkResponse = await fetch('/api/stripe/get-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user?.id }),
          })
          const checkResult = await checkResponse.json()
          if (!checkResult.subscription || checkResult.subscription.status !== 'active') {
            await syncSubscription()
          }
        }, 2000)
      }, 1000)
    }
    if (searchParams?.get('canceled') === 'true') {
      setToast({ message: 'Le paiement a été annulé.', type: 'info' })
    }
  }, [user, authLoading, router, searchParams])

  const loadSubscription = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/get-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()
      if (result.subscription) {
        setSubscription(result.subscription)
      } else {
        setSubscription(null)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncSubscription = async () => {
    if (!user) return

    setProcessing(true)
    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        setToast({ message: result.error || 'Erreur lors de la synchronisation.', type: 'error' })
        setProcessing(false)
        return
      }

      if (result.subscription) {
        setSubscription(result.subscription)
        setToast({ message: 'Abonnement synchronisé avec succès !', type: 'success' })
      } else {
        setSubscription(null)
        setToast({ message: result.message || 'Aucun abonnement actif trouvé.', type: 'info' })
      }
    } catch (error: any) {
      console.error('Error syncing subscription:', error)
      setToast({ message: 'Erreur lors de la synchronisation.', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      setToast({ message: 'Vous devez être connecté.', type: 'error' })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
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

  const handleCancel = async () => {
    if (!user) return

    setProcessing(true)
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
        setProcessing(false)
        return
      }

      setToast({ message: 'Votre abonnement sera annulé à la fin de la période en cours.', type: 'success' })
      await loadSubscription()
    } catch (error: any) {
      console.error('Error canceling subscription:', error)
      setToast({ message: 'Erreur lors de l\'annulation.', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const handleResume = async () => {
    if (!user) return

    setProcessing(true)
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
        setToast({ message: result.error || 'Erreur lors de la reprise.', type: 'error' })
        setProcessing(false)
        return
      }

      setToast({ message: 'Votre abonnement a été repris avec succès !', type: 'success' })
      await loadSubscription()
    } catch (error: any) {
      console.error('Error resuming subscription:', error)
      setToast({ message: 'Erreur lors de la reprise.', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isActive = subscription && 
    subscription.status === 'active' &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date()) &&
    !subscription.cancel_at_period_end

  if (authLoading || loading) {
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
            className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
          >
            <HiDocumentText className="text-xl" />
            <span className="dashboard-text">Mes fiches</span>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="dashboard-h1">Abonnement</h1>
                <p className="dashboard-text text-dashboard-text-secondary mt-2">
                  Gérez votre abonnement pour créer et publier vos fiches
                </p>
              </div>
              <button
                onClick={syncSubscription}
                disabled={processing || loading}
                className="dashboard-btn-secondary flex items-center gap-2"
                title="Synchroniser avec Stripe"
              >
                <HiRefresh className={`text-lg ${processing ? 'animate-spin' : ''}`} />
                <span>Synchroniser</span>
              </button>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              isOpen={true}
              onClose={() => setToast(null)}
            />
          )}

          {/* Carte d'abonnement */}
          <div className="dashboard-card border border-dashboard-border mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="dashboard-h2 mb-2">Abonnement Mensuel</h2>
                <p className="dashboard-text text-dashboard-text-secondary">
                  Créez et publiez autant de fiches que vous souhaitez
                </p>
              </div>
              <div className="text-right">
                <div className="dashboard-card-value text-4xl">9,99€</div>
                <p className="dashboard-text-secondary">par mois</p>
              </div>
            </div>

            {/* Statut de l'abonnement */}
            {isActive ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <HiCheckCircle className="text-2xl" />
                  <span className="dashboard-text font-semibold">Abonnement actif</span>
                </div>
                {subscription.current_period_end && (
                  <div className="flex items-center space-x-2 text-dashboard-text-secondary">
                    <HiClock className="text-lg" />
                    <span className="dashboard-text">
                      Prochain renouvellement : {formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                )}
                {subscription.cancel_at_period_end ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="dashboard-text text-yellow-800 mb-2">
                      Votre abonnement sera annulé à la fin de la période en cours.
                    </p>
                    <button
                      onClick={handleResume}
                      disabled={processing}
                      className="dashboard-btn-primary"
                    >
                      {processing ? 'Traitement...' : 'Reprendre l\'abonnement'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={processing}
                    className="dashboard-btn-secondary"
                  >
                    {processing ? 'Traitement...' : 'Annuler l\'abonnement'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-dashboard-text-secondary">
                  <HiXCircle className="text-2xl" />
                  <span className="dashboard-text">Aucun abonnement actif</span>
                </div>
                <p className="dashboard-text text-dashboard-text-secondary">
                  Pour créer et publier des fiches, vous devez souscrire à un abonnement mensuel.
                </p>
                <button
                  onClick={handleSubscribe}
                  disabled={processing}
                  className="dashboard-btn-primary"
                >
                  {processing ? 'Redirection...' : 'S\'abonner maintenant - 9,99€/mois'}
                </button>
              </div>
            )}
          </div>

          {/* Avantages */}
          <div className="dashboard-card border border-dashboard-border">
            <h3 className="dashboard-h2 mb-4">Avantages de l'abonnement</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <HiCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                <span className="dashboard-text">Création illimitée de fiches</span>
              </li>
              <li className="flex items-start space-x-3">
                <HiCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                <span className="dashboard-text">Publication immédiate de vos fiches</span>
              </li>
              <li className="flex items-start space-x-3">
                <HiCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                <span className="dashboard-text">Visibilité dans l'annuaire</span>
              </li>
              <li className="flex items-start space-x-3">
                <HiCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                <span className="dashboard-text">Statistiques détaillées de vos fiches</span>
              </li>
              <li className="flex items-start space-x-3">
                <HiCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                <span className="dashboard-text">Support client prioritaire</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

