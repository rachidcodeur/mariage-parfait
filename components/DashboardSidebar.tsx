'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HiHome, HiViewGrid, HiDocumentText, HiCog, HiLogout, HiMenu, HiX, HiClipboardList, HiSparkles, HiHeart } from 'react-icons/hi'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface DashboardSidebarProps {
  userName: string
  userEmail: string
  activePath?: string
  isAdmin?: boolean
}

export default function DashboardSidebar({ userName, userEmail, activePath, isAdmin = false }: DashboardSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/espace-pro')
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    if (!pathname) return false
    
    if (activePath) {
      return pathname === activePath
    }
    
    // Correspondance exacte - toujours vrai
    if (pathname === path) {
      return true
    }
    
    // Pour /dashboard, on vérifie que c'est exactement /dashboard (pas /dashboard/...)
    // Cela évite que /dashboard soit actif quand on est sur /dashboard/fiches
    if (path === '/dashboard') {
      return false // Ne jamais activer /dashboard si on n'est pas exactement dessus (déjà géré par le if ci-dessus)
    }
    
    // Pour les autres chemins, on vérifie que le pathname commence par le chemin + /
    // Cela permet d'activer l'onglet même si on est sur une sous-page
    // Ex: path='/dashboard/fiches' sera actif si pathname='/dashboard/fiches' ou '/dashboard/fiches/nouvelle'
    return pathname.startsWith(path + '/')
  }

  const getMenuItemClasses = (path: string) => {
    const active = isActive(path)
    if (active) {
      // Fond rose clair pour l'onglet actif (#fce7f3 = primary-100)
      return 'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-semibold'
    }
    return 'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-white text-dashboard-text-secondary hover:bg-dashboard-hover'
  }
  
  const getMenuItemStyle = (path: string) => {
    const active = isActive(path)
    if (active) {
      return {
        backgroundColor: '#fce7f3', // primary-100
        color: '#ca3b76', // dashboard-primary
      }
    }
    return {}
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-dashboard-primary text-white rounded-lg flex items-center justify-center shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          dashboard-sidebar shadow-lg fixed h-full border-r border-dashboard-border z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-4 sm:p-6 border-b border-dashboard-border">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="w-8 h-8 bg-dashboard-primary rounded-lg flex items-center justify-center">
                <HiHeart className="text-white text-xl" />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-dashboard-text-main">Mariage Parfait</span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="lg:hidden text-dashboard-text-secondary hover:text-dashboard-primary"
              aria-label="Fermer le menu"
            >
              <HiX className="text-xl" />
            </button>
          </div>
          <Link
            href="/"
            className="flex items-center space-x-2 text-dashboard-text-secondary hover:text-dashboard-primary transition"
            onClick={closeMobileMenu}
          >
            <HiHome className="text-lg" />
            <span className="dashboard-text">Retour à l'accueil</span>
          </Link>
        </div>

        <nav className="p-2 sm:p-4 space-y-2 overflow-y-auto flex-1 bg-white">
          <Link
            href="/dashboard"
            onClick={closeMobileMenu}
            className={getMenuItemClasses('/dashboard')}
            style={getMenuItemStyle('/dashboard')}
          >
            <HiViewGrid className="text-xl" />
            <span className="dashboard-text">Tableau de bord</span>
          </Link>
          <Link
            href="/dashboard/fiches"
            onClick={closeMobileMenu}
            className={getMenuItemClasses('/dashboard/fiches')}
            style={getMenuItemStyle('/dashboard/fiches')}
          >
            <HiDocumentText className="text-xl" />
            <span className="dashboard-text">Mes fiches</span>
          </Link>
          <Link
            href="/dashboard/mise-en-avant"
            onClick={closeMobileMenu}
            className={getMenuItemClasses('/dashboard/mise-en-avant')}
            style={getMenuItemStyle('/dashboard/mise-en-avant')}
          >
            <HiSparkles className="text-xl" />
            <span className="dashboard-text">Mise en avant</span>
          </Link>
          <Link
            href="/dashboard/revendications"
            onClick={closeMobileMenu}
            className={getMenuItemClasses('/dashboard/revendications')}
            style={getMenuItemStyle('/dashboard/revendications')}
          >
            <HiClipboardList className="text-xl" />
            <span className="dashboard-text">Mes revendications</span>
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/admin/claims"
              onClick={closeMobileMenu}
              className={getMenuItemClasses('/dashboard/admin/claims')}
              style={getMenuItemStyle('/dashboard/admin/claims')}
            >
              <HiClipboardList className="text-xl" />
              <span className="dashboard-text">Gestion des revendications</span>
            </Link>
          )}
          <Link
            href="/dashboard/parametres"
            onClick={closeMobileMenu}
            className={getMenuItemClasses('/dashboard/parametres')}
            style={getMenuItemStyle('/dashboard/parametres')}
          >
            <HiCog className="text-xl" />
            <span className="dashboard-text">Paramètres</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dashboard-border bg-dashboard-bg-primary">
          <div className="mb-4">
            <p className="text-sm font-semibold text-dashboard-text-main truncate">{userName} Prestataire</p>
            <p className="dashboard-text-secondary text-xs truncate">{userEmail}</p>
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
    </>
  )
}

