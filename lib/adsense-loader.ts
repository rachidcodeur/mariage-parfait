'use client'

// Script global pour charger AdSense une seule fois (côté client uniquement)
let adsenseScriptLoaded = false
let adsenseScriptLoading = false

export function loadAdSenseScript(clientId: string): Promise<void> {
  // Vérifier que nous sommes côté client
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('AdSense can only be loaded on the client side'))
  }

  return new Promise((resolve, reject) => {
    // Si déjà chargé, résoudre immédiatement
    if (adsenseScriptLoaded && (window as any).adsbygoogle) {
      resolve()
      return
    }

    // Si en cours de chargement, attendre
    if (adsenseScriptLoading) {
      const checkInterval = setInterval(() => {
        if (adsenseScriptLoaded && (window as any).adsbygoogle) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkInterval)
        if (!adsenseScriptLoaded) {
          reject(new Error('AdSense script loading timeout'))
        }
      }, 10000)
      return
    }

    // Vérifier si le script existe déjà dans le DOM
    const existingScript = document.querySelector(`script[src*="adsbygoogle.js?client=${clientId}"]`)
    if (existingScript) {
      // Le script existe déjà, attendre qu'il soit chargé
      const checkInterval = setInterval(() => {
        if ((window as any).adsbygoogle) {
          adsenseScriptLoaded = true
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkInterval)
        if (!adsenseScriptLoaded) {
          reject(new Error('AdSense script loading timeout'))
        }
      }, 10000)
      return
    }

    // Charger le script
    adsenseScriptLoading = true
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      adsenseScriptLoaded = true
      adsenseScriptLoading = false
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      resolve()
    }
    script.onerror = () => {
      adsenseScriptLoading = false
      reject(new Error('Failed to load AdSense script'))
    }
    document.head.appendChild(script)
  })
}

