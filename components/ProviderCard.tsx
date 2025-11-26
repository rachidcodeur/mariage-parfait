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

interface ProviderCardProps {
  provider: Provider
  categorySlug: string
}

export default function ProviderCard({ provider, categorySlug }: ProviderCardProps) {
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
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden block h-full group"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={provider.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">Aucune image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {provider.is_featured && (
          <span className="inline-block bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded mb-2">
            Recommandé
          </span>
        )}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-500 transition">
          {provider.name}
        </h3>
        {provider.summary && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {provider.summary}
          </p>
        )}
        {provider.city && (
          <p className="text-gray-500 text-xs mb-4">
            📍 {provider.city}
          </p>
        )}
        <span className="inline-block bg-primary-100 text-primary-500 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-200 transition">
          Voir l'annonce
        </span>
      </div>
    </Link>
  )
}

