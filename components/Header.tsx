'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { HiHeart, HiMenu, HiX, HiUser } from 'react-icons/hi'
import { useAuth } from '@/components/AuthProvider'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const isAnnuaire = pathname?.startsWith('/annuaire')
  const isContact = pathname === '/contact'
  const isBlog = pathname?.startsWith('/blog')
  const isFAQ = pathname === '/faq'

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <HiHeart className="text-primary-500 text-2xl" />
            <span className="text-xl font-semibold text-gray-800">Mariage Parfait</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/blog" 
              className={`transition ${
                isBlog 
                  ? 'text-primary-500 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Blog
            </Link>
            <Link 
              href="/faq" 
              className={`transition ${
                isFAQ 
                  ? 'text-primary-500 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              FAQ
            </Link>
            <Link 
              href="/annuaire" 
              className={`transition ${
                isAnnuaire 
                  ? 'text-primary-500 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Annuaire
            </Link>
            <Link 
              href="/contact" 
              className={`transition ${
                isContact 
                  ? 'text-primary-500 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
              >
                <HiUser className="text-lg" />
                <span>Mon Compte</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/espace-pro#signup"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
                >
                  Inscription
                </Link>
                <Link
                  href="/espace-pro#login"
                  className="border border-primary-500 text-primary-500 px-4 py-2 rounded-lg hover:bg-primary-50 transition"
                >
                  Connexion
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary-600 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <HiX className="text-2xl" />
            ) : (
              <HiMenu className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/blog"
                className={`transition ${
                  isBlog 
                    ? 'text-primary-500 font-semibold' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/faq"
                className={`transition ${
                  isFAQ 
                    ? 'text-primary-500 font-semibold' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/annuaire"
                className={`transition ${
                  isAnnuaire 
                    ? 'text-primary-500 font-semibold' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Annuaire
              </Link>
              <Link
                href="/contact"
                className={`transition ${
                  isContact 
                    ? 'text-primary-500 font-semibold' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {!loading && user ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiUser className="text-lg" />
                    <span>Mon Compte</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/espace-pro#signup"
                      className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Inscription
                    </Link>
                    <Link
                      href="/espace-pro#login"
                      className="border border-primary-500 text-primary-500 px-4 py-2 rounded-lg hover:bg-primary-50 transition text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

