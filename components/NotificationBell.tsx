'use client'

import { useEffect, useState } from 'react'
import { HiBell } from 'react-icons/hi'
import { getSupabaseClient } from '@/lib/supabase-client'
import { isSuperAdmin } from '@/lib/admin-utils'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function NotificationBell() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAndLoadCount = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const admin = await isSuperAdmin(user)
      setIsAdmin(admin)

      if (admin) {
        await loadPendingCount()
      } else {
        setLoading(false)
      }
    }

    checkAdminAndLoadCount()
  }, [user])

  const loadPendingCount = async () => {
    try {
      const supabase = getSupabaseClient()
      const { count, error } = await supabase
        .from('provider_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (error) {
        console.error('Error loading pending claims count:', error)
        setPendingCount(0)
      } else {
        setPendingCount(count || 0)
      }
    } catch (error) {
      console.error('Error loading pending claims count:', error)
      setPendingCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Recharger le compteur périodiquement (toutes les 30 secondes)
  useEffect(() => {
    if (isAdmin && !loading) {
      loadPendingCount()
      const interval = setInterval(() => {
        loadPendingCount()
      }, 30000) // 30 secondes

      return () => clearInterval(interval)
    }
  }, [isAdmin, loading])

  // Ne pas afficher si l'utilisateur n'est pas admin
  if (!isAdmin || loading) {
    return null
  }

  return (
    <Link
      href="/dashboard/admin/claims"
      className="relative p-2 text-dashboard-text-secondary hover:text-dashboard-primary transition"
      aria-label={`Notifications${pendingCount > 0 ? ` (${pendingCount} en attente)` : ''}`}
    >
      <HiBell className="text-2xl" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-dashboard-alert text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
    </Link>
  )
}

