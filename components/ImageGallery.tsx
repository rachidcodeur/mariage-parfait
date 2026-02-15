'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const displayImages = images.filter((img) => img && img.trim() !== '')

  if (displayImages.length === 0) {
    return null
  }

  const selectedImage = displayImages[selectedIndex]

  // Répartir les miniatures en 2 lignes (moitié / moitié)
  const half = Math.ceil(displayImages.length / 2)
  const row1 = displayImages.slice(0, half)
  const row2 = displayImages.slice(half)

  return (
    <div className="mb-8 md:mb-[60px] grid grid-cols-1 md:grid-cols-[18%_85%] gap-4 md:gap-[35px]">
      {/* Colonne 1 : sur mobile = 3 colonnes (33% chacune, 3e vide), sur desktop = 2 lignes à gauche */}
      <div className="grid grid-cols-3 md:flex md:flex-col pt-1 gap-[20px] order-2 md:order-1">
        <div className="flex flex-col items-start gap-5 min-w-0">
          {row1.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative w-[95%] md:w-[95%] aspect-square overflow-hidden rounded-lg transition ${
                selectedIndex === i
                  ? 'ring-2 ring-primary-500 ring-offset-2'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              <img
                src={src}
                alt={`${alt} - ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        <div className="flex flex-col items-start gap-5 min-w-0">
          {row2.map((_, idx) => {
            const i = half + idx
            const src = displayImages[i]
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`relative w-[95%] md:w-[95%] aspect-square overflow-hidden rounded-lg transition ${
                  selectedIndex === i
                    ? 'ring-2 ring-primary-500 ring-offset-2'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <img
                  src={src}
                  alt={`${alt} - ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            )
          })}
        </div>
        <div className="md:contents" aria-hidden="true" />
      </div>

      {/* Colonne 2 : image agrandie au clic (ratio 4:3), en premier sur mobile */}
      <div className="order-1 md:order-2 flex md:justify-center">
        <div className="relative w-full md:w-[95%] aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={selectedImage}
            alt={selectedIndex === 0 ? alt : `${alt} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
