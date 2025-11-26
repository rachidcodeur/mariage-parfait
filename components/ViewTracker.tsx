'use client'

import { useEffect, useRef } from 'react'

interface ViewTrackerProps {
  providerId: number
  providerSlug: string
}

export default function ViewTracker({ providerId, providerSlug }: ViewTrackerProps) {
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return
    }

    // Vérifier que providerId est valide
    if (!providerId || (typeof providerId !== 'number' && typeof providerId !== 'string')) {
      console.error('[ViewTracker] Invalid providerId:', providerId)
      return
    }

    // Convertir en nombre si nécessaire
    const numericProviderId = typeof providerId === 'string' ? parseInt(providerId, 10) : providerId
    if (isNaN(numericProviderId)) {
      console.error('[ViewTracker] providerId is not a valid number:', providerId)
      return
    }

    // Vérifier si on a déjà tracké cette fiche dans cette session
    // On vérifie à la fois si c'est marqué ET si le tracking a réussi
    const sessionKey = `view_tracked_${numericProviderId}`
    const sessionSuccessKey = `view_tracked_success_${numericProviderId}`
    
    try {
      const alreadyTracked = sessionStorage.getItem(sessionKey)
      const trackingSuccess = sessionStorage.getItem(sessionSuccessKey)
      
      // Si déjà tracké ET que le tracking a réussi, on ne fait rien
      if (alreadyTracked === 'true' && trackingSuccess === 'true') {
        console.log('[ViewTracker] Already tracked successfully in sessionStorage for provider:', numericProviderId)
        return
      }
      
      // Si marqué mais pas de succès, on réessaie (peut-être que l'API a échoué)
      if (alreadyTracked === 'true' && trackingSuccess !== 'true') {
        console.log('[ViewTracker] Previous tracking may have failed, retrying for provider:', numericProviderId)
        // On continue pour réessayer
      }
    } catch (e) {
      console.warn('[ViewTracker] sessionStorage not available:', e)
      // Si sessionStorage n'est pas disponible, on continue quand même
    }

    // Marquer comme "en cours de tracking" dans sessionStorage pour éviter les doubles comptages
    try {
      sessionStorage.setItem(sessionKey, 'true')
      sessionStorage.removeItem(sessionSuccessKey) // Retirer le flag de succès pour permettre un nouvel essai
    } catch (e) {
      console.warn('[ViewTracker] Could not set sessionStorage:', e)
    }

    // Incrémenter les vues
    const trackView = async () => {
      try {
        console.log('[ViewTracker] Tracking view for provider:', numericProviderId)
        const response = await fetch('/api/providers/increment-views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ providerId: numericProviderId }),
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.error('[ViewTracker] Error tracking view:', result)
          // Si l'API échoue, retirer les flags de sessionStorage pour permettre une nouvelle tentative
          try {
            sessionStorage.removeItem(sessionKey)
            sessionStorage.removeItem(sessionSuccessKey)
          } catch (e) {
            // Ignorer les erreurs de sessionStorage
          }
        } else {
          console.log('[ViewTracker] View tracked successfully:', result)
          // Marquer comme succès dans sessionStorage
          try {
            sessionStorage.setItem(sessionSuccessKey, 'true')
          } catch (e) {
            console.warn('[ViewTracker] Could not set success flag in sessionStorage:', e)
          }
        }
      } catch (error) {
        console.error('[ViewTracker] Error tracking view:', error)
        // Si l'API échoue, retirer les flags de sessionStorage pour permettre une nouvelle tentative
        try {
          sessionStorage.removeItem(sessionKey)
          sessionStorage.removeItem(sessionSuccessKey)
        } catch (e) {
          // Ignorer les erreurs de sessionStorage
        }
      }
    }

    // Délai de 500ms pour s'assurer que la page est chargée
    const timeout = setTimeout(trackView, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [providerId, providerSlug])

  // Ce composant ne rend rien
  return null
}

