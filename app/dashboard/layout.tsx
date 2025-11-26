'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import ChatWidget from '@/components/ChatWidget'
import NotificationBell from '@/components/NotificationBell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/espace-pro')
    }
  }, [user, loading, router])

  // Ne pas afficher le contenu si l'utilisateur n'est pas connecté
  if (loading) {
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
    <>
      {children}
      {/* Widget de chat - apparaît sur toutes les pages du dashboard */}
      <ChatWidget />
    </>
  )
}

