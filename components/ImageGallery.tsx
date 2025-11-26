'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Toujours prendre seulement les 2 premières images (image 1 et image 2)
  const displayImages = images.slice(0, 2)

  if (displayImages.length === 0) {
    return null
  }

  const mainImage = displayImages[selectedImageIndex]
  
  // L'autre image pour la miniature (si on a 2 images)
  const thumbnailImage = displayImages.length > 1 
    ? displayImages[selectedImageIndex === 0 ? 1 : 0]
    : null

  return (
    <div className="mb-8">
      {/* Image principale */}
      <div className="mb-4">
        <img
          src={mainImage}
          alt={alt}
          className="w-full h-96 object-cover rounded-lg"
        />
      </div>
      
      {/* Miniatures cliquables - toujours 2 cases avec image 1 et image 2, format carré, largeur réduite */}
      {displayImages.length > 1 && thumbnailImage && (
        <div className="flex justify-start gap-4">
          <button
            onClick={() => setSelectedImageIndex(0)}
            className={`relative w-48 h-48 overflow-hidden rounded-lg group cursor-pointer flex-shrink-0 ${
              selectedImageIndex === 0 ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <img
              src={displayImages[0]}
              alt={`${alt} - Image 1`}
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition" />
          </button>
          <button
            onClick={() => setSelectedImageIndex(1)}
            className={`relative w-48 h-48 overflow-hidden rounded-lg group cursor-pointer flex-shrink-0 ${
              selectedImageIndex === 1 ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <img
              src={displayImages[1]}
              alt={`${alt} - Image 2`}
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition" />
          </button>
        </div>
      )}
    </div>
  )
}

