'use client'

import { useEffect, useRef } from 'react'

interface ClickTrackerProps {
  providerId: number
  providerSlug: string
  type: 'phone' | 'website'
}

export default function ClickTracker({ providerId, providerSlug, type }: ClickTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return
    }

    // Vérifier que providerId est valide
    if (!providerId || (typeof providerId !== 'number' && typeof providerId !== 'string')) {
      console.error(`[ClickTracker-${type}] Invalid providerId:`, providerId)
      return
    }

    // Convertir en nombre si nécessaire
    const numericProviderId = typeof providerId === 'string' ? parseInt(providerId, 10) : providerId
    if (isNaN(numericProviderId)) {
      console.error(`[ClickTracker-${type}] providerId is not a valid number:`, providerId)
      return
    }

    // Vérifier si on a déjà tracké ce clic dans cette session
    const sessionKey = `${type}_click_tracked_${numericProviderId}`
    const sessionSuccessKey = `${type}_click_tracked_success_${numericProviderId}`
    
    try {
      const alreadyTracked = sessionStorage.getItem(sessionKey)
      const trackingSuccess = sessionStorage.getItem(sessionSuccessKey)
      
      // Si déjà tracké ET que le tracking a réussi, on ne fait rien
      if (alreadyTracked === 'true' && trackingSuccess === 'true') {
        console.log(`[ClickTracker-${type}] Already tracked successfully in sessionStorage for provider:`, numericProviderId)
        hasTracked.current = true
        return
      }
    } catch (e) {
      console.warn(`[ClickTracker-${type}] sessionStorage not available:`, e)
    }

    // Fonction pour tracker le clic
    const trackClick = async () => {
      if (hasTracked.current) return
      hasTracked.current = true

      try {
        console.log(`[ClickTracker-${type}] Tracking click for provider:`, numericProviderId)
        const response = await fetch(`/api/providers/increment-${type}-clicks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ providerId: numericProviderId }),
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.error(`[ClickTracker-${type}] Error tracking click:`, result)
          hasTracked.current = false
          // Si l'API échoue, retirer les flags de sessionStorage pour permettre une nouvelle tentative
          try {
            sessionStorage.removeItem(sessionKey)
            sessionStorage.removeItem(sessionSuccessKey)
          } catch (e) {
            // Ignorer les erreurs de sessionStorage
          }
        } else {
          console.log(`[ClickTracker-${type}] Click tracked successfully:`, result)
          // Marquer comme succès dans sessionStorage
          try {
            sessionStorage.setItem(sessionKey, 'true')
            sessionStorage.setItem(sessionSuccessKey, 'true')
          } catch (e) {
            console.warn(`[ClickTracker-${type}] Could not set success flag in sessionStorage:`, e)
          }
        }
      } catch (error) {
        console.error(`[ClickTracker-${type}] Error tracking click:`, error)
        hasTracked.current = false
        // Si l'API échoue, retirer les flags de sessionStorage pour permettre une nouvelle tentative
        try {
          sessionStorage.removeItem(sessionKey)
          sessionStorage.removeItem(sessionSuccessKey)
        } catch (e) {
          // Ignorer les erreurs de sessionStorage
        }
      }
    }

    // Trouver le lien correspondant et ajouter un event listener
    const findAndTrackLink = () => {
      let linkElement: HTMLAnchorElement | null = null

      if (type === 'phone') {
        // Chercher tous les liens tel: et prendre le premier
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]')
        if (phoneLinks.length > 0) {
          linkElement = phoneLinks[0] as HTMLAnchorElement
        }
      } else if (type === 'website') {
        // Chercher le lien du site web (celui qui contient "Visiter le site web")
        const links = document.querySelectorAll('a[href^="http"]')
        links.forEach(link => {
          const text = link.textContent || ''
          const href = link.getAttribute('href') || ''
          // Éviter les liens Instagram, Facebook, etc.
          if ((text.includes('Visiter le site web') || text.includes('site web')) && 
              !href.includes('instagram') && 
              !href.includes('facebook') && 
              !href.includes('linkedin') &&
              !href.includes('tiktok')) {
            linkElement = link as HTMLAnchorElement
          }
        })
      }

      if (linkElement) {
        // Ajouter un event listener pour tracker le clic
        const handleClick = (e: MouseEvent) => {
          // Vérifier si on a déjà tracké dans cette session
          const sessionKey = `${type}_click_tracked_${numericProviderId}`
          const sessionSuccessKey = `${type}_click_tracked_success_${numericProviderId}`
          
          try {
            const alreadyTracked = sessionStorage.getItem(sessionKey)
            const trackingSuccess = sessionStorage.getItem(sessionSuccessKey)
            
            if (alreadyTracked === 'true' && trackingSuccess === 'true') {
              console.log(`[ClickTracker-${type}] Already tracked in this session, skipping`)
              return
            }
          } catch (e) {
            // Ignorer les erreurs de sessionStorage
          }

          // Marquer comme "en cours de tracking" dans sessionStorage
          try {
            sessionStorage.setItem(sessionKey, 'true')
            sessionStorage.removeItem(sessionSuccessKey)
          } catch (e) {
            console.warn(`[ClickTracker-${type}] Could not set sessionStorage:`, e)
          }

          // Tracker le clic
          trackClick()
        }

        linkElement.addEventListener('click', handleClick, { once: false })

        // Nettoyer l'event listener au démontage
        return () => {
          linkElement?.removeEventListener('click', handleClick)
        }
      } else {
        console.warn(`[ClickTracker-${type}] Link element not found for provider:`, numericProviderId)
      }
    }

    // Attendre que le DOM soit prêt
    const timeout = setTimeout(findAndTrackLink, 200)

    return () => {
      clearTimeout(timeout)
    }
  }, [providerId, providerSlug, type])

  // Ce composant ne rend rien
  return null
}

