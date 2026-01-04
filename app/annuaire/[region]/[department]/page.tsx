import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { notFound } from 'next/navigation'
import { getRegionBySlug } from '@/lib/regions'
import { getProviderCategories, getProvidersGroupedByCategory, getPremiumProviders } from '@/lib/supabase'
import CategorySlider from '@/components/CategorySlider'
import ProviderCard from '@/components/ProviderCard'
import PremiumProviderCard from '@/components/PremiumProviderCard'

interface PageProps {
  params: {
    region: string
    department: string
  }
}

// Forcer le rendu dynamique pour cette page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DepartmentPage({ params }: PageProps) {
  const regionData = getRegionBySlug(params.region)

  if (!regionData) {
    notFound()
  }

  const department = regionData.departments.find(d => d.code === params.department)

  if (!department) {
    notFound()
  }

  // Récupérer les prestataires groupés par catégorie
  const providersByCategory = await getProvidersGroupedByCategory(params.department)
  
  // Extraire uniquement les catégories qui ont des prestataires
  const categoriesWithProviders = providersByCategory.map(({ category }) => category)

  // Récupérer 6 prestataires premium au hasard
  const premiumProviders = await getPremiumProviders(params.department, 6)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'
  const pageUrl = `${baseUrl}/annuaire/${params.region}/${params.department}`

  // Données structurées JSON-LD pour la page de département
  const departmentStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Prestataires de mariage en ${department.name} (${department.code})`,
    description: `Annuaire complet des prestataires de mariage dans le département ${department.name} (${department.code}) en ${regionData.name}.`,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: `Prestataires de mariage en ${department.name}`,
      description: `Liste des prestataires de mariage disponibles dans le département ${department.name}`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Annuaire',
          item: `${baseUrl}/annuaire`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: regionData.name,
          item: `${baseUrl}/annuaire/${params.region}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: department.name,
          item: pageUrl,
        },
      ],
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(departmentStructuredData) }}
      />
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Prestataires de mariage en {department.name} ({department.code})
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Découvrez tous les prestataires de mariage disponibles dans le département {department.name}.
                Trouvez les professionnels qui vous accompagneront pour créer le mariage de vos rêves.
              </p>
            </div>
          </div>
        </section>

        {/* Section Premium - Mise en avant */}
        {premiumProviders.length > 0 && (
          <section className="py-12 bg-gradient-to-b from-primary-50 to-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Nos meilleurs prestataires
                </h2>
                <p className="text-gray-600">
                  Découvrez nos prestataires recommandés pour votre mariage
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumProviders.map((provider) => (
                  <PremiumProviderCard
                    key={provider.id}
                    provider={provider}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Slider - Sticky avec effet glass */}
        {categoriesWithProviders.length > 0 && (
          <CategorySlider categories={categoriesWithProviders} />
        )}

        {/* Providers by Category */}
        <section className="py-16 bg-white" data-providers-section>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {providersByCategory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Aucun prestataire disponible pour le moment dans le département {department.name}.
                </p>
              </div>
            ) : (
              providersByCategory.map(({ category, providers }) => (
                <div key={category.id} id={`category-${category.slug}`} className="mb-16 scroll-mt-24">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                    {category.name}
                  </h2>
                  {providers.length === 0 ? (
                    <p className="text-gray-500">Aucun prestataire dans cette catégorie.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {providers.map((provider) => (
                        <ProviderCard
                          key={provider.id}
                          provider={provider}
                          categorySlug={category.slug}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// Génération des métadonnées SEO
export async function generateMetadata({ params }: PageProps) {
  const regionData = getRegionBySlug(params.region)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

  if (!regionData) {
    return {
      title: 'Département non trouvé - Mariage Parfait',
    }
  }

  const department = regionData.departments.find(d => d.code === params.department)

  if (!department) {
    return {
      title: 'Département non trouvé - Mariage Parfait',
    }
  }

  const pageUrl = `${baseUrl}/annuaire/${params.region}/${params.department}`
  const title = `Prestataires de mariage en ${department.name} (${department.code}) - Mariage Parfait`
  const description = `Trouvez tous les prestataires de mariage dans le département ${department.name} (${department.code}) en ${regionData.name}. Photographes, traiteurs, salles de réception, fleuristes, DJ et plus encore. Annuaire complet et gratuit.`
  const imageUrl = `${baseUrl}/images/general/accueil-mariage-parfait.webp`

  return {
    title,
    description,
    keywords: `prestataires mariage ${department.name}, mariage ${department.code}, ${regionData.name}, photographe mariage, traiteur mariage, salle réception, organisation mariage`,
    authors: [{ name: 'Mariage Parfait' }],
    icons: {
      icon: [
        {
          url: `${baseUrl}/images/general/favicon.ico`,
          sizes: 'any',
        },
        {
          url: `${baseUrl}/images/general/favicon.svg`,
          type: 'image/svg+xml',
        },
      ],
      shortcut: `${baseUrl}/images/general/favicon.ico`,
      apple: `${baseUrl}/images/general/favicon.svg`,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Mariage Parfait',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Prestataires de mariage en ${department.name}`,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
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

