'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ArticleCard from '@/components/ArticleCard'
import AdSense from '@/components/AdSense'
import Link from 'next/link'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { HiSearch, HiHeart, HiDocumentText, HiCake, HiCamera, HiSparkles, HiShoppingBag, HiTrendingUp, HiGlobeAlt, HiPencil, HiCollection, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { categoryIdToSlug, categoryNames, categorySlugToId } from '@/lib/categories'

const categories = [
  { id: 'all', name: 'Tous les articles', icon: HiDocumentText },
  { id: 'beaute', name: 'Beauté', icon: HiPencil },
  { id: 'budget', name: 'Budget', icon: HiCollection },
  { id: 'ceremonie-reception', name: 'Cérémonie & Réception', icon: HiHeart },
  { id: 'decoration', name: 'Décoration', icon: HiSparkles },
  { id: 'gastronomie', name: 'Gastronomie', icon: HiCake },
  { id: 'inspiration', name: 'Inspiration', icon: HiTrendingUp },
  { id: 'papeterie-details', name: 'Papeterie & Détails', icon: HiDocumentText },
  { id: 'photo-video', name: 'Photo & Vidéo', icon: HiCamera },
  { id: 'robes-mariee', name: 'Robes de Mariée', icon: HiShoppingBag },
  { id: 'prestataires', name: 'Prestataires', icon: HiShoppingBag },
  { id: 'tendances', name: 'Tendances', icon: HiTrendingUp },
  { id: 'voyage-noces', name: 'Voyage de Noces', icon: HiGlobeAlt },
]

const categoryIcons: Record<string, any> = {
  beaute: HiPencil,
  budget: HiCollection,
  'ceremonie-reception': HiHeart,
  decoration: HiSparkles,
  gastronomie: HiCake,
  inspiration: HiTrendingUp,
  'papeterie-details': HiDocumentText,
  'photo-video': HiCamera,
  prestataires: HiShoppingBag,
  'robes-mariee': HiShoppingBag,
  tendances: HiTrendingUp,
  'voyage-noces': HiGlobeAlt,
}

// Contenu dynamique pour chaque catégorie
const categoryContent: Record<string, { title: string; description: string }> = {
  all: {
    title: 'Le Mariage de Vos Rêves Commence Ici',
    description: 'Trouvez l\'inspiration, les meilleurs conseils et les prestataires parfaits pour faire de votre grand jour un moment inoubliable.'
  },
  beaute: {
    title: 'Beauté & Maquillage pour Votre Mariage',
    description: 'Découvrez les meilleurs conseils beauté, les tendances maquillage et coiffure pour être resplendissante le jour J. Trouvez les professionnels qui sauront sublimer votre beauté naturelle.'
  },
  budget: {
    title: 'Gérer le Budget de Votre Mariage',
    description: 'Apprenez à organiser votre budget mariage intelligemment, à économiser sans compromettre la qualité et à prioriser vos dépenses. Des conseils pratiques pour un mariage à votre portée.'
  },
  'ceremonie-reception': {
    title: 'Cérémonie & Réception Parfaites',
    description: 'Inspirez-vous pour créer une cérémonie unique et une réception mémorable. De la décoration à l\'animation, trouvez tous les conseils et prestataires pour un événement inoubliable.'
  },
  decoration: {
    title: 'Décoration de Mariage : Inspirations & Conseils',
    description: 'Explorez les dernières tendances en décoration de mariage, des idées créatives et des conseils d\'experts pour transformer votre lieu de réception en un espace magique et personnalisé.'
  },
  gastronomie: {
    title: 'Gastronomie & Traiteur pour Votre Mariage',
    description: 'Découvrez les meilleurs conseils pour choisir votre menu, organiser la dégustation et sélectionner le traiteur idéal. Des idées culinaires pour ravir vos invités et créer des moments gourmands.'
  },
  inspiration: {
    title: 'Inspiration Mariage : Idées & Tendances',
    description: 'Puiséez dans notre sélection d\'idées créatives, de thèmes originaux et d\'inspirations pour personnaliser votre mariage. Laissez libre cours à votre imagination pour un événement unique.'
  },
  'papeterie-details': {
    title: 'Papeterie & Détails de Mariage',
    description: 'Trouvez l\'inspiration pour vos faire-part, menus, place cards et tous les détails qui font la différence. Des conseils pour une papeterie élégante et personnalisée qui reflète votre style.'
  },
  'photo-video': {
    title: 'Photo & Vidéo : Immortalisez Votre Mariage',
    description: 'Conseils pour choisir votre photographe et vidéaste, préparer votre shooting et capturer les plus beaux moments. Trouvez les professionnels qui sauront raconter votre histoire d\'amour.'
  },
  'robes-mariee': {
    title: 'Robe de Mariée : Trouvez la Robe de Vos Rêves',
    description: 'Guide complet pour choisir votre robe de mariée, des tendances actuelles aux conseils d\'essayage. Découvrez les meilleures boutiques et créateurs pour trouver la robe qui vous ressemble.'
  },
  prestataires: {
    title: 'Trouvez les Meilleurs Prestataires de Mariage',
    description: 'Découvrez notre annuaire de prestataires vérifiés et recommandés. Photographes, traiteurs, fleuristes, DJ... Trouvez les professionnels qui feront de votre mariage un succès.'
  },
  tendances: {
    title: 'Tendances Mariage 2024',
    description: 'Restez à la page avec les dernières tendances mariage : couleurs, décoration, cérémonies et styles. Inspirez-vous des tendances actuelles pour créer un mariage moderne et élégant.'
  },
  'voyage-noces': {
    title: 'Voyage de Noces : Destinations & Conseils',
    description: 'Planifiez votre lune de miel de rêve avec nos conseils sur les meilleures destinations, les budgets et les astuces voyage. Des idées pour un voyage romantique et inoubliable après votre mariage.'
  },
}

interface Article {
  id: number
  created_at: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string | null
  category_id: number
  author: string
  meta_description: string
  keywords: string
  views: number
  likes: number
  read_time: string
}

export default function BlogPage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Extraire la catégorie depuis l'URL (query params)
  const getCategoryFromUrl = () => {
    const categoryParam = searchParams?.get('category')
    if (categoryParam && (categorySlugToId[categoryParam] || categoryParam === 'all')) {
      return categoryParam
    }
    return 'all'
  }

  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromUrl())
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)
  const categorySliderRef = useRef<HTMLDivElement>(null)

  // Mettre à jour la catégorie quand l'URL change - synchrone pour éviter le flash
  useLayoutEffect(() => {
    const categoryFromUrl = getCategoryFromUrl()
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl)
      setPage(1) // Réinitialiser la page quand on change de catégorie
    }
  }, [pathname, searchParams, selectedCategory])

  // Debounce pour la recherche (attendre 500ms après que l'utilisateur arrête de taper)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    // Réinitialiser la page à 1 quand on change de catégorie ou de recherche
    setPage(1)
  }, [selectedCategory, debouncedSearchQuery])

  const articlesSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory, page, debouncedSearchQuery])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const url = `/api/articles?category=${selectedCategory}&page=${page}&limit=30${debouncedSearchQuery ? `&search=${encodeURIComponent(debouncedSearchQuery)}` : ''}`
      console.log('[BlogPage] Fetching articles:', { selectedCategory, url })
      const response = await fetch(url)
      const data = await response.json()
      console.log('[BlogPage] Articles received:', { 
        count: data.articles?.length || 0, 
        total: data.pagination?.total || 0,
        category: selectedCategory 
      })
      setArticles(data.articles || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalArticles(data.pagination?.total || 0)
      
      // Scroll automatique vers les résultats après une recherche
      if (debouncedSearchQuery && data.articles && data.articles.length > 0 && articlesSectionRef.current) {
        setTimeout(() => {
          articlesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Plus besoin de filtrer côté client, la recherche se fait côté serveur
  const filteredArticles = articles

  // Insérer des publicités tous les 9 articles (après chaque groupe de 3 lignes)
  const articlesWithAds: (Article | 'ad')[] = []
  filteredArticles.forEach((article, index) => {
    articlesWithAds.push(article)
    if ((index + 1) % 9 === 0 && index < filteredArticles.length - 1) {
      articlesWithAds.push('ad')
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Breadcrumbs */}
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Blog' },
          ]}
          centered={true}
        />

        {/* Hero Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Notre Blog
              </h1>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                  <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Rechercher un article (ex: décoration, budget, voyage...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation - Slider (Sticky avec effet glass) */}
        <div className="sticky top-[56px] md:top-[64px] z-40 pt-[22px] md:py-4 pb-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
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
                  {categories.map((category) => {
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (category.id !== selectedCategory) {
                            // Changer immédiatement avant la mise à jour de l'URL
                            setSelectedCategory(category.id)
                            // Mettre à jour l'URL sans recharger la page
                            const newUrl = category.id === 'all' 
                              ? '/blog' 
                              : `/blog?category=${category.id}`
                            router.push(newUrl, { scroll: false })
                          }
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition whitespace-nowrap ${
                          selectedCategory === category.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        <span>{category.name}</span>
                      </button>
                    )
                  })}
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

        {/* Banner Section - Dynamique selon la catégorie */}
        <section className="py-[35px] bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <div
                className="h-96 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/images/blog/fond-blog-mariage-parfait.webp)',
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center overflow-hidden">
                  <div 
                    key={selectedCategory}
                    className="text-center text-white px-8 w-full"
                    style={{
                      animation: 'fadeInUp 0.25s ease-out'
                    }}
                  >
                    <h2 className="text-[22px] md:text-4xl lg:text-5xl font-bold mt-5 mb-6">
                      {categoryContent[selectedCategory]?.title || categoryContent.all.title}
                    </h2>
                    <p className="text-base md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                      {categoryContent[selectedCategory]?.description || categoryContent.all.description}
                    </p>
                    <Link
                      href="/annuaire"
                      className="inline-block bg-white text-primary-500 px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold mb-5"
                    >
                      Découvrir les prestataires
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section ref={articlesSectionRef} className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="mb-8">
              {debouncedSearchQuery && (
                <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HiSearch className="text-primary-500 text-xl" />
                      <p className="text-primary-700 font-medium">
                        Recherche : "<span className="font-semibold">{debouncedSearchQuery}</span>"
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setDebouncedSearchQuery('')
                      }}
                      className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                    >
                      Effacer
                    </button>
                  </div>
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedCategory === 'all' ? 'Tous les articles' : categories.find(c => c.id === selectedCategory)?.name}
                {debouncedSearchQuery && ` - ${totalArticles} résultat${totalArticles > 1 ? 's' : ''}`}
              </h2>
              <p className="text-gray-600">
                Page {page} sur {totalPages} • {totalArticles} article{totalArticles > 1 ? 's' : ''} au total
              </p>
            </div>

            {/* Articles Grid */}
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-600">Chargement des articles...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articlesWithAds.map((item, index) => {
                  if (item === 'ad') {
                    return (
                      <div key={`ad-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-8">
                        <div className="w-full max-w-4xl">
                          <AdSense adSlot="7473800600" />
                        </div>
                      </div>
                    )
                  }
                  
                  const article = item as Article
                  const categorySlug = categoryIdToSlug[article.category_id] || 'inspiration'
                  const Icon = categoryIcons[categorySlug] || HiDocumentText
                  const categoryName = categoryNames[categorySlug] || categories.find(c => c.id === categorySlug)?.name || 'Article'
                  
                  return (
                    <ArticleCard
                      key={article.id}
                      icon={Icon}
                      category={categoryName}
                      title={article.title}
                      description={article.excerpt}
                      date={formatDate(article.created_at)}
                      readTime={article.read_time}
                      href={`/blog/${article.slug}`}
                    />
                  )
                })}
                
                    {filteredArticles.length === 0 && !loading && (
                      <div className="col-span-3 text-center py-12">
                        <p className="text-gray-600 mb-4">
                          {selectedCategory !== 'all' 
                            ? `Aucun article trouvé dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}".` 
                            : 'Aucun article disponible pour le moment.'}
                        </p>
                        {selectedCategory !== 'all' && (
                          <div className="text-sm text-gray-500 mt-4">
                            <p>Catégorie sélectionnée : {selectedCategory}</p>
                            <p>ID de catégorie attendu : {categorySlugToId[selectedCategory] || 'N/A'}</p>
                            <p className="mt-2">
                              <a 
                                href={`/api/articles/debug?category=${selectedCategory}`} 
                                target="_blank"
                                className="text-primary-500 hover:underline"
                              >
                                Vérifier les articles dans cette catégorie
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                {/* Bouton Précédent - Fond rose sur mobile, normal sur desktop */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed md:border md:border-gray-300 md:hover:bg-gray-50 bg-primary-500 text-white md:bg-transparent md:text-gray-800 hover:bg-primary-600 md:hover:bg-gray-50"
                  aria-label="Page précédente"
                >
                  <HiChevronLeft className="text-lg sm:text-xl text-white md:text-gray-800" />
                  <span className="hidden sm:inline">Précédent</span>
                </button>
                
                {/* Numéros de page - Visibles sur tous les écrans */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${
                          page === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {totalPages > 5 && page < totalPages - 2 && (
                    <span className="px-2 text-gray-600">...</span>
                  )}
                  
                  {totalPages > 5 && page < totalPages - 2 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                {/* Bouton Suivant - Fond rose sur mobile, normal sur desktop */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed md:border md:border-gray-300 md:hover:bg-gray-50 bg-primary-500 text-white md:bg-transparent md:text-gray-800 hover:bg-primary-600 md:hover:bg-gray-50"
                  aria-label="Page suivante"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <HiChevronRight className="text-lg sm:text-xl text-white md:text-gray-800" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

