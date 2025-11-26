import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRegionBySlug, regions, regionToSlug } from '@/lib/regions'

interface PageProps {
  params: {
    region: string
  }
}

export default function RegionPage({ params }: PageProps) {
  const regionData = getRegionBySlug(params.region)

  if (!regionData) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'
  const pageUrl = `${baseUrl}/annuaire/${params.region}`

  // Données structurées JSON-LD pour la page de région
  const regionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Prestataires de mariage en ${regionData.name}`,
    description: `Annuaire complet des prestataires de mariage dans la région ${regionData.name}.`,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: `Prestataires de mariage en ${regionData.name}`,
      description: `Liste des départements avec prestataires de mariage dans la région ${regionData.name}`,
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
          item: pageUrl,
        },
      ],
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(regionStructuredData) }}
      />
      <Header />
      
      <main className="flex-grow">
        {/* Department Selection */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
              Choisissez un département en {regionData.name}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-8">
              {regionData.departments.map((department) => (
                <Link
                  key={department.code}
                  href={`/annuaire/${params.region}/${department.code}`}
                  className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-4 rounded-lg text-center font-medium transition border border-gray-300 hover:border-primary-500 shadow-sm"
                >
                  <div className="text-base font-semibold text-gray-800 mb-2">
                    {department.name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {department.code}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// Génération des métadonnées SEO pour chaque région
export async function generateMetadata({ params }: PageProps) {
  const regionData = getRegionBySlug(params.region)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

  if (!regionData) {
    return {
      title: 'Région non trouvée - Mariage Parfait',
    }
  }

  const pageUrl = `${baseUrl}/annuaire/${params.region}`
  const title = `Prestataires de mariage en ${regionData.name} - Mariage Parfait`
  const description = `Trouvez les meilleurs prestataires de mariage dans la région ${regionData.name}. Photographes, traiteurs, salles de réception, fleuristes, DJ et plus encore. Annuaire complet par département.`
  const imageUrl = `${baseUrl}/images/general/accueil-mariage-parfait.webp`

  return {
    title,
    description,
    keywords: `prestataires mariage ${regionData.name}, mariage ${regionData.name}, photographe mariage, traiteur mariage, salle réception, organisation mariage`,
    authors: [{ name: 'Mariage Parfait' }],
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
          alt: `Prestataires de mariage en ${regionData.name}`,
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

// Génération statique des pages pour toutes les régions
export async function generateStaticParams() {
  // Génère les slugs pour toutes les régions depuis la liste
  return regions.map((regionName) => ({
    region: regionToSlug(regionName),
  }))
}

