'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { updateUserMetadata, updatePassword, deleteAccount, signOut } from '@/lib/auth'
import { HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiEye, HiEyeOff, HiTrash, HiClipboardList, HiCheckCircle, HiSparkles, HiHeart } from 'react-icons/hi'
import Link from 'next/link'
import ConfirmDialog from '@/components/ConfirmDialog'
import Toast from '@/components/Toast'
import NotificationBell from '@/components/NotificationBell'

export default function ParametresPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [userName, setUserName] = useState('')

  // États pour les formulaires
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // États pour l'affichage des mots de passe
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // États pour les chargements et messages
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/espace-pro')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || '')
      setLastName(user.user_metadata?.last_name || '')
      setPhone(user.user_metadata?.phone || '')
      setEmail(user.email || '')
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)

    try {
      const result = await updateUserMetadata({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      })

      if (result.error) {
        setToast({ message: result.error, type: 'error' })
      } else {
        setToast({ message: 'Profil mis à jour avec succès.', type: 'success' })
        await refreshUser()
      }
    } catch (error: any) {
      setToast({ message: 'Erreur lors de la mise à jour du profil.', type: 'error' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      setToast({ message: 'Le mot de passe doit contenir au moins 6 caractères.', type: 'error' })
      return
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: 'Les mots de passe ne correspondent pas.', type: 'error' })
      return
    }

    setSavingPassword(true)

    try {
      const result = await updatePassword(newPassword)

      if (result.error) {
        setToast({ message: result.error, type: 'error' })
      } else {
        setToast({ message: 'Mot de passe mis à jour avec succès.', type: 'success' })
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      setToast({ message: 'Erreur lors de la mise à jour du mot de passe.', type: 'error' })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    setShowDeleteConfirm(false)

    try {
      const result = await deleteAccount()

      if (result.error) {
        setToast({ message: result.error, type: 'error' })
        setDeletingAccount(false)
      } else {
        setToast({ message: 'Votre compte a été supprimé.', type: 'success' })
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (error: any) {
      setToast({ message: 'Erreur lors de la suppression du compte.', type: 'error' })
      setDeletingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-secondary">
        <p className="text-dashboard-text-secondary">Chargement...</p>
      </div>
    )
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
                href="/dashboard/mise-en-avant"
                className="flex items-center space-x-3 px-4 py-3 text-dashboard-text-secondary hover:bg-dashboard-hover rounded-lg transition"
              >
                <HiSparkles className="text-xl" />
                <span className="dashboard-text">Mise en avant</span>
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
            className="flex items-center space-x-3 px-4 py-3 bg-dashboard-hover text-dashboard-primary rounded-lg font-semibold"
          >
            <HiCog className="text-xl" />
            <span className="dashboard-text font-semibold">Paramètres</span>
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
        <div className="dashboard-content px-[170px]">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="dashboard-h1 mb-2">
                Paramètres
              </h1>
              <p className="dashboard-text text-dashboard-text-secondary">
                Gérez vos informations personnelles et les paramètres de votre compte.
              </p>
            </div>
            <NotificationBell />
          </div>

        {/* Section: Informations personnelles */}
        <div className="dashboard-card border border-dashboard-border mb-6">
          <h2 className="dashboard-h2 mb-6">Informations personnelles</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block dashboard-h3 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="dashboard-input w-full"
                  placeholder="Jean"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block dashboard-h3 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="dashboard-input w-full"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block dashboard-h3 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="dashboard-input w-full"
                placeholder="06 12 34 56 78"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="dashboard-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Section: Email (lecture seule) */}
        <div className="dashboard-card border border-dashboard-border mb-6">
          <h2 className="dashboard-h2 mb-6">Adresse email</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block dashboard-h3 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                className="dashboard-input w-full bg-dashboard-bg-secondary cursor-not-allowed"
                placeholder="contact@exemple.com"
                disabled
                readOnly
              />
              <p className="dashboard-text-secondary mt-2">
                L'adresse email ne peut pas être modifiée.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Mot de passe */}
        <div className="dashboard-card border border-dashboard-border mb-6">
          <h2 className="dashboard-h2 mb-6">Mot de passe</h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block dashboard-h3 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="dashboard-input w-full pr-10"
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dashboard-text-light hover:text-dashboard-text-main"
                >
                  {showNewPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block dashboard-h3 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="dashboard-input w-full pr-10"
                  placeholder="Répétez le mot de passe"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dashboard-text-light hover:text-dashboard-text-main"
                >
                  {showConfirmPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="dashboard-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPassword ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
              </button>
            </div>
          </form>
        </div>

        {/* Section: Supprimer le compte */}
        <div className="dashboard-card border border-dashboard-border border-dashboard-alert/20">
          <h2 className="dashboard-h2 mb-2 text-dashboard-alert">Supprimer mon compte</h2>
          <p className="dashboard-text-secondary mb-6">
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
          </p>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deletingAccount}
            className="bg-dashboard-alert hover:bg-dashboard-alert/90 !text-white px-6 py-2 rounded-lg dashboard-text font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <HiTrash className="text-lg !text-white" />
            {deletingAccount ? 'Suppression...' : 'Supprimer mon compte'}
          </button>
        </div>
        </div>
      </main>

      {/* Modal de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Êtes-vous sûr ?"
        message="Cette action est irréversible. Votre compte et toutes vos données seront définitivement supprimés de nos serveurs."
        confirmText="Confirmer la suppression"
        cancelText="Annuler"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
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

