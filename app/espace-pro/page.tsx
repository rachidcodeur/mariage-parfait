'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { signIn, signUp, signInWithMagicLink } from '@/lib/auth'
import { HiSearch, HiDocumentText, HiChartBar, HiCheck, HiEye, HiEyeOff, HiMail, HiX } from 'react-icons/hi'

export default function EspaceProPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Rediriger si déjà connecté
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Vérifier l'ancre dans l'URL pour ouvrir le bon onglet
    const hash = window.location.hash
    if (hash === '#signup') {
      setActiveTab('signup')
    } else if (hash === '#login') {
      setActiveTab('login')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    if (useMagicLink) {
      if (!email) {
        setError('Veuillez entrer votre email')
        setIsSubmitting(false)
        return
      }
      const result = await signInWithMagicLink(email)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Un lien de connexion a été envoyé à votre adresse email')
      }
      setIsSubmitting(false)
      return
    }

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      setIsSubmitting(false)
      return
    }

    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Connexion réussie ! Redirection...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }
    setIsSubmitting(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
      setError('Veuillez remplir tous les champs')
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsSubmitting(false)
      return
    }

    // Validation du numéro de téléphone (format basique)
    const phoneRegex = /^[0-9+\s\-()]+$/
    if (!phoneRegex.test(phone)) {
      setError('Le numéro de téléphone n\'est pas valide')
      setIsSubmitting(false)
      return
    }

    const result = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    })
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (user) {
    return null // La redirection se fait dans useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Espace Pro – Faites connaître votre entreprise de mariage
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
                Inscrivez votre activité et gagnez en visibilité auprès de milliers de futurs mariés partout en France.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="#signup"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab('signup')
                    document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
                >
                  Créer un compte
                </a>
                <a
                  href="#login"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab('login')
                    document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Se connecter
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Formulaire de connexion/inscription */}
        <section id="login" className="py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg px-12 py-12">
              {/* Messages d'erreur/succès */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                  <p className="text-red-700">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                    <HiX className="text-xl" />
                  </button>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <p className="text-green-700">{success}</p>
                  <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
                    <HiX className="text-xl" />
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div className="flex mb-6 border-b border-gray-200">
                <button
                  onClick={() => {
                    setActiveTab('login')
                    setError(null)
                    setSuccess(null)
                  }}
                  className={`flex-1 py-2 text-center font-medium transition ${
                    activeTab === 'login'
                      ? 'text-gray-800 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    setActiveTab('signup')
                    setError(null)
                    setSuccess(null)
                  }}
                  className={`flex-1 py-2 text-center font-medium transition ${
                    activeTab === 'signup'
                      ? 'text-gray-800 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  S'inscrire
                </button>
              </div>

              {/* Formulaire de connexion */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@exemple.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  {!useMagicLink && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Connexion...' : 'Se connecter'}
                  </button>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="magic-link"
                      checked={useMagicLink}
                      onChange={(e) => setUseMagicLink(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="magic-link" className="text-sm text-gray-600 flex items-center space-x-1">
                      <HiMail className="text-primary-500" />
                      <span>Se connecter avec un lien magique</span>
                    </label>
                  </div>
                  <a href="#" className="block text-center text-primary-500 text-sm hover:text-primary-600 transition">
                    Mot de passe oublié ?
                  </a>
                </form>
              )}

              {/* Formulaire d'inscription */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jean"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Dupont"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="signup-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@exemple.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="signup-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Section: Vos avantages */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Vos avantages sur Mariage Parfait
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                L'Espace Pro Mariage Parfait est destiné aux prestataires du mariage: photographes, traiteurs, 
                fleuristes, DJs, salles de réception, wedding planners... Rejoindre notre annuaire, c'est bénéficier 
                d'une visibilité ciblée auprès des couples qui préparent leur mariage.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <HiSearch className="text-primary-500 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Plus de visibilité</h3>
                <p className="text-gray-600">
                  Apparaissez dans notre annuaire et soyez trouvé par des milliers de couples.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <HiDocumentText className="text-primary-500 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Fiche professionnelle</h3>
                <p className="text-gray-600">
                  Présentez votre activité avec photos, vidéos, description et avis.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <HiChartBar className="text-primary-500 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Statistiques détaillées</h3>
                <p className="text-gray-600">
                  Suivez les vues de votre fiche, les clics vers votre site et plus encore.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <HiCheck className="text-primary-500 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Référencement SEO</h3>
                <p className="text-gray-600">
                  Bénéficiez de notre trafic pour améliorer votre position sur Google.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Comment ça marche ? */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-gray-600 text-lg">
                En 3 étapes simples, votre entreprise gagne en visibilité.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-500 text-white rounded-full mx-auto mb-4 text-3xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Créez votre compte</h3>
                <p className="text-gray-600">
                  L'inscription est simple, rapide et gratuite.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-500 text-white rounded-full mx-auto mb-4 text-3xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Publiez votre fiche</h3>
                <p className="text-gray-600">
                  Ajoutez vos photos, description et coordonnées.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-500 text-white rounded-full mx-auto mb-4 text-3xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Gagnez en visibilité</h3>
                <p className="text-gray-600">
                  Touchez de nouveaux clients qui préparent leur mariage.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
