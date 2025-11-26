'use client'

import { useEffect, useRef, useState } from 'react'
import AdSense from './AdSense'

interface ArticleContentWithAdsProps {
  html: string
  adSlot?: string
}

export default function ArticleContentWithAds({ html, adSlot = '4138966929' }: ArticleContentWithAdsProps) {
  const [contentParts, setContentParts] = useState<{ before: string; after: string } | null>(null)

  useEffect(() => {
    // Parser le HTML pour trouver le 2ème paragraphe
    const paragraphRegex = /<p[^>]*>.*?<\/p>/gi
    const matches = Array.from(html.matchAll(paragraphRegex))
    
    if (matches.length >= 2) {
      const secondMatch = matches[1]
      const insertPosition = secondMatch.index! + secondMatch[0].length
      
      const before = html.slice(0, insertPosition)
      const after = html.slice(insertPosition)
      
      setContentParts({ before, after })
    } else {
      // Si moins de 2 paragraphes, afficher tout le contenu
      setContentParts({ before: html, after: '' })
    }
  }, [html])

  if (!contentParts) {
    return (
      <div 
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div className="prose prose-lg max-w-none mb-8">
      {/* Contenu avant l'encart */}
      <div dangerouslySetInnerHTML={{ __html: contentParts.before }} />
      
      {/* Encart publicitaire au milieu */}
      {contentParts.after && (
        <div className="my-8 flex justify-center">
          <div className="w-full max-w-4xl border border-gray-200 rounded-lg p-4 bg-gray-50">
            <AdSense adSlot={adSlot} />
          </div>
        </div>
      )}
      
      {/* Contenu après l'encart */}
      {contentParts.after && (
        <div dangerouslySetInnerHTML={{ __html: contentParts.after }} />
      )}
    </div>
  )
}

