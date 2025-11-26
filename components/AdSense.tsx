'use client'

import { useEffect, useRef } from 'react'
import { loadAdSenseScript } from '@/lib/adsense-loader'

interface AdSenseProps {
  adSlot?: string
  adFormat?: string
  fullWidthResponsive?: boolean
}

export default function AdSense({ 
  adSlot = '1234567890', 
  adFormat = 'auto',
  fullWidthResponsive = true 
}: AdSenseProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXX'
  const adRef = useRef<HTMLDivElement>(null)
  const isAdInitialized = useRef(false)

  // Ne pas afficher si les valeurs sont des placeholders
  if (clientId === 'ca-pub-XXXXXXXXXX' || !adSlot || adSlot === '1234567890') {
    return (
      <div className="w-full min-h-[250px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm text-center px-4">
          Configurez AdSense dans .env.local<br />
          <span className="text-xs">NEXT_PUBLIC_ADSENSE_CLIENT_ID</span>
        </p>
      </div>
    )
  }

  // Charger le script et initialiser l'annonce
  useEffect(() => {
    if (isAdInitialized.current || !adRef.current) {
      return
    }

    const initializeAd = async () => {
      try {
        // Charger le script AdSense (une seule fois)
        await loadAdSenseScript(clientId)

        // Attendre un peu pour que le script soit complètement chargé
        await new Promise(resolve => setTimeout(resolve, 100))

        // Initialiser cette annonce spécifique
        if (adRef.current && (window as any).adsbygoogle && !isAdInitialized.current) {
          try {
            ;(window as any).adsbygoogle.push({})
            isAdInitialized.current = true
          } catch (pushError) {
            console.error('AdSense push error:', pushError)
            // Réessayer après un court délai
            setTimeout(() => {
              if (adRef.current && (window as any).adsbygoogle && !isAdInitialized.current) {
                try {
                  ;(window as any).adsbygoogle.push({})
                  isAdInitialized.current = true
                } catch (retryError) {
                  console.error('AdSense retry push error:', retryError)
                }
              }
            }, 500)
          }
        }
      } catch (err) {
        console.error('AdSense initialization error:', err)
      }
    }

    // Délai pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      initializeAd()
    }, 100)

    return () => clearTimeout(timer)
  }, [clientId, adSlot])

  return (
    <div ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '250px' }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  )
}

