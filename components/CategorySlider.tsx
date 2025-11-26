'use client'

import { useRef, useState, useEffect } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

interface ProviderCategory {
  id: number
  name: string
  slug: string
}

interface CategorySliderProps {
  categories: ProviderCategory[]
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  const categorySliderRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Observer les changements de scroll pour détecter quelle section est visible
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id^="category-"], [data-providers-section]')
      const offset = 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const rect = section.getBoundingClientRect()
        
        if (rect.top <= offset) {
          if (section.id && section.id.startsWith('category-')) {
            // Extraire le slug de l'ID (category-slug)
            const slug = section.id.replace('category-', '')
            setActiveCategory(slug)
          } else {
            setActiveCategory(null) // "Toutes les catégories"
          }
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Appel initial

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = (slug: string | null) => {
    setActiveCategory(slug)
    if (slug === null) {
      // Scroll vers le haut de la section des prestataires
      const providersSection = document.querySelector('[data-providers-section]')
      if (providersSection) {
        const offset = 100
        const elementPosition = providersSection.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    } else {
      // Chercher l'élément avec l'ID category-{slug}
      const element = document.getElementById(`category-${slug}`)
      if (element) {
        const offset = 100 // Offset pour le header sticky
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
  }

  return (
    <div className="sticky top-[64px] z-40 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="relative px-12">
          <button
            onClick={() => {
              if (categorySliderRef.current) {
                categorySliderRef.current.scrollBy({ left: -200, behavior: 'smooth' })
              }
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition border border-gray-200"
            aria-label="Catégories précédentes"
          >
            <HiChevronLeft className="text-gray-700 text-xl" />
          </button>
          <div 
            ref={categorySliderRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-3 min-w-max">
              {/* Option "Toutes les catégories" */}
              <button
                onClick={() => handleClick(null)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition whitespace-nowrap border ${
                  activeCategory === null
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white/90 backdrop-blur-sm text-gray-800 border-gray-300 hover:border-primary-500'
                }`}
              >
                <span>Toutes les catégories</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleClick(category.slug)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition whitespace-nowrap border ${
                    activeCategory === category.slug
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 border-gray-300 hover:border-primary-500'
                  }`}
                >
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              if (categorySliderRef.current) {
                categorySliderRef.current.scrollBy({ left: 200, behavior: 'smooth' })
              }
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition border border-gray-200"
            aria-label="Catégories suivantes"
          >
            <HiChevronRight className="text-gray-700 text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}

