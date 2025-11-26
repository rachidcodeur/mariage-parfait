'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Provider {
  id: number
  name: string
  slug: string
  summary: string | null
  description: string | null
  logo_url: string | null
  gallery_images: string[] | null
  category_id: number
  code_departement: string | null
  city: string | null
  is_featured: boolean
}

interface PremiumProviderCardProps {
  provider: Provider
}

export default function PremiumProviderCard({ provider }: PremiumProviderCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Déterminer l'URL de l'image à afficher
  useEffect(() => {
    let galleryImages: string[] | null = null
    
    if (provider.gallery_images) {
      if (Array.isArray(provider.gallery_images)) {
        galleryImages = provider.gallery_images
      } else if (typeof provider.gallery_images === 'string') {
        try {
          galleryImages = JSON.parse(provider.gallery_images)
        } catch (e) {
          galleryImages = null
        }
      }
    }
    
    const firstImage = galleryImages && galleryImages.length > 0 ? galleryImages[0] : null
    setImageUrl(firstImage || provider.logo_url || null)
  }, [provider.gallery_images, provider.logo_url])

  return (
    <Link
      href={`/annuaire/prestataire/${provider.slug}`}
      className="relative bg-white rounded-xl border-2 border-primary-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden block h-full group transform hover:-translate-y-1"
    >
      {/* Ruban "Meilleur" */}
      <div className="absolute top-4 right-0 z-10">
        <div className="bg-primary-500 text-white px-4 py-1.5 shadow-lg rounded-[30px]">
          <div className="flex items-center gap-1">
            <span className="text-sm">⭐</span>
            <span className="text-xs font-bold">Meilleur</span>
          </div>
        </div>
      </div>

      {/* Image avec overlay gradient */}
      <div className="relative h-56 w-full bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={provider.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-primary-400 text-sm font-medium">Aucune image</span>
          </div>
        )}
        
        {/* Nom sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg line-clamp-2">
            {provider.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        {provider.summary && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed">
            {provider.summary}
          </p>
        )}
        {provider.city && (
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{provider.city}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition group-hover:shadow-md">
            Découvrir
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

