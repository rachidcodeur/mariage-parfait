import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageGallery from '@/components/ImageGallery'
import ViewTracker from '@/components/ViewTracker'
import ClickTracker from '@/components/ClickTracker'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProviderBySlug, getProviderCategories } from '@/lib/supabase'
import { HiArrowLeft, HiMail, HiGlobeAlt, HiPhone, HiLocationMarker } from 'react-icons/hi'
import { FaInstagram } from 'react-icons/fa'

interface PageProps {
  params: {
    slug: string
  }
}

// Forcer le rendu dynamique pour cette page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProviderPage({ params }: PageProps) {
  const provider = await getProviderBySlug(params.slug)

  if (!provider) {
    notFound()
  }

  // Récupérer la catégorie du prestataire
  const categories = await getProviderCategories()
  const category = categories.find(c => c.id === provider.category_id)

  // Construire l'adresse complète
  const fullAddress = provider.address || 
    [provider.street_name, provider.city, provider.postal_code]
      .filter(Boolean)
      .join(', ')

  // Images de la galerie - parser si nécessaire et prendre seulement les 2 premières
  let galleryImages: string[] = []
  if (provider.gallery_images) {
    if (Array.isArray(provider.gallery_images)) {
      galleryImages = provider.gallery_images
    } else if (typeof provider.gallery_images === 'string') {
      try {
        galleryImages = JSON.parse(provider.gallery_images)
      } catch (e) {
        galleryImages = []
      }
    }
  }
  
  // Prendre seulement les 2 premières images
  const allImages = galleryImages.filter(img => img && img.trim() !== '').slice(0, 2)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'
  const providerUrl = `${baseUrl}/annuaire/prestataire/${provider.slug}`

  // Données structurées JSON-LD pour le prestataire (LocalBusiness)
  const providerStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.name,
    description: provider.summary || provider.description?.replace(/<[^>]*>/g, '') || '',
    url: provider.website || providerUrl,
    image: provider.logo_url || (allImages.length > 0 ? allImages[0] : undefined),
    telephone: provider.phone || undefined,
    email: provider.email || undefined,
    address: fullAddress ? {
      '@type': 'PostalAddress',
      streetAddress: provider.street_name || provider.address || '',
      addressLocality: provider.city || '',
      postalCode: provider.postal_code || '',
      addressCountry: 'FR',
    } : undefined,
    geo: (provider.latitude && provider.longitude) ? {
      '@type': 'GeoCoordinates',
      latitude: provider.latitude,
      longitude: provider.longitude,
    } : undefined,
    aggregateRating: provider.google_rating ? {
      '@type': 'AggregateRating',
      ratingValue: provider.google_rating,
      reviewCount: provider.google_reviews_count || 0,
    } : undefined,
    sameAs: [
      provider.website,
      provider.facebook_url,
      provider.instagram_url,
      provider.linkedin_url,
      provider.tiktok_url,
    ].filter(Boolean),
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(providerStructuredData) }}
      />
      <ViewTracker providerId={provider.id} providerSlug={provider.slug} />
      {provider.phone && (
        <ClickTracker providerId={provider.id} providerSlug={provider.slug} type="phone" />
      )}
      {provider.website && (
        <ClickTracker providerId={provider.id} providerSlug={provider.slug} type="website" />
      )}
      <Header />

      <main className="flex-grow">
        {/* Back Link */}
        <section className="py-4 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <Link
              href="/annuaire"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition"
            >
              <HiArrowLeft className="text-xl" />
              <span>Retour à l'annuaire</span>
            </Link>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2">
                {/* Title and Category */}
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    {provider.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    {category && (
                      <span className="inline-flex items-center px-4 py-1 rounded-full bg-primary-100 text-primary-500 text-sm font-medium">
                        {category.name}
                      </span>
                    )}
                    {fullAddress && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <HiLocationMarker className="text-gray-400" />
                        <span className="text-sm">{fullAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Gallery - Interactive */}
                {allImages.length > 0 && (
                  <ImageGallery images={allImages} alt={provider.name} />
                )}

                {/* Présentation Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Présentation</h2>
                  {provider.description ? (
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: provider.description }}
                    />
                  ) : provider.summary ? (
                    <p className="text-gray-700 leading-relaxed">{provider.summary}</p>
                  ) : (
                    <p className="text-gray-500">Aucune description disponible.</p>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <aside className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-[64px] space-y-8">
                  {/* Prendre contact */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Prendre contact</h3>
                    <div className="space-y-3">
                      {provider.email && (
                        <a
                          href={`mailto:${provider.email}`}
                          className="w-full flex items-center justify-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
                        >
                          <HiMail className="text-xl" />
                          <span>Contacter par email</span>
                        </a>
                      )}
                      {provider.website && (
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                        >
                          <HiGlobeAlt className="text-xl" />
                          <span>Visiter le site web</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Coordonnées</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      {provider.phone && (
                        <div className="flex items-start space-x-3">
                          <HiPhone className="text-gray-400 mt-1 flex-shrink-0" />
                          <a href={`tel:${provider.phone}`} className="hover:text-primary-500 transition">
                            {provider.phone}
                          </a>
                        </div>
                      )}
                      {provider.email && (
                        <div className="flex items-start space-x-3">
                          <HiMail className="text-gray-400 mt-1 flex-shrink-0" />
                          <a href={`mailto:${provider.email}`} className="hover:text-primary-500 transition break-all">
                            {provider.email}
                          </a>
                        </div>
                      )}
                      {fullAddress && (
                        <div className="flex items-start space-x-3">
                          <HiLocationMarker className="text-gray-400 mt-1 flex-shrink-0" />
                          <span>{fullAddress}</span>
                        </div>
                      )}
                      {provider.instagram_url && (
                        <div className="pt-2">
                          <a
                            href={provider.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-10 h-10 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                            aria-label="Instagram"
                          >
                            <FaInstagram className="text-xl" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avis Google */}
                  {provider.google_reviews_url && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Avis Google</h3>
                      {provider.google_rating && (
                        <div className="mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-800">{provider.google_rating}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-yellow-400 ${
                                    i < Math.round(provider.google_rating!) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {provider.google_reviews_count && (
                              <span className="text-sm text-gray-600">
                                ({provider.google_reviews_count} avis)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <a
                        href={provider.google_reviews_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                      >
                        Voir tous les avis
                      </a>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// Génération des métadonnées SEO
export async function generateMetadata({ params }: PageProps) {
  const provider = await getProviderBySlug(params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

  if (!provider) {
    return {
      title: 'Prestataire non trouvé - Mariage Parfait',
    }
  }

  const categories = await getProviderCategories()
  const category = categories.find(c => c.id === provider.category_id)
  const providerUrl = `${baseUrl}/annuaire/prestataire/${provider.slug}`
  
  // Construire l'adresse complète
  const fullAddress = provider.address || 
    [provider.street_name, provider.city, provider.postal_code]
      .filter(Boolean)
      .join(', ')

  const description = provider.summary || 
    provider.description?.replace(/<[^>]*>/g, '').substring(0, 160) || 
    `Découvrez ${provider.name}, prestataire de mariage${category ? ` spécialisé en ${category.name.toLowerCase()}` : ''}${fullAddress ? ` à ${fullAddress}` : ''}.`

  // Image du prestataire (logo ou première image de la galerie)
  let imageUrl = `${baseUrl}/images/general/accueil-mariage-parfait.webp`
  if (provider.logo_url) {
    imageUrl = provider.logo_url.startsWith('http') ? provider.logo_url : `${baseUrl}${provider.logo_url}`
  } else if (provider.gallery_images) {
    const galleryImages = Array.isArray(provider.gallery_images) 
      ? provider.gallery_images 
      : typeof provider.gallery_images === 'string' 
        ? JSON.parse(provider.gallery_images) 
        : []
    if (galleryImages.length > 0) {
      imageUrl = galleryImages[0].startsWith('http') ? galleryImages[0] : `${baseUrl}${galleryImages[0]}`
    }
  }

  return {
    title: `${provider.name} - Prestataire Mariage${category ? ` ${category.name}` : ''} - Mariage Parfait`,
    description,
    keywords: `${provider.name}, prestataire mariage${category ? `, ${category.name}` : ''}${fullAddress ? `, ${fullAddress}` : ''}, organisation mariage`,
    authors: [{ name: 'Mariage Parfait' }],
    openGraph: {
      title: `${provider.name} - Prestataire Mariage`,
      description,
      url: providerUrl,
      siteName: 'Mariage Parfait',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: provider.name,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${provider.name} - Prestataire Mariage`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: providerUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

