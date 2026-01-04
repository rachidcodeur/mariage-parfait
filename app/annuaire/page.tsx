import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { HiArrowRight, HiCheck } from 'react-icons/hi'
import { regions, regionToSlug } from '@/lib/regions'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Annuaire des Prestataires de Mariage en France - Mariage Parfait',
  description: 'Trouvez rapidement les meilleurs prestataires de mariage partout en France. Photographes, traiteurs, salles de réception, fleuristes, DJ... Explorez notre annuaire par région et département.',
  keywords: 'annuaire prestataires mariage, prestataires mariage France, photographe mariage, traiteur mariage, salle réception mariage, fleuriste mariage, DJ mariage, organisation mariage',
  authors: [{ name: 'Mariage Parfait' }],
  icons: {
    icon: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/images/general/favicon.ico`,
        sizes: 'any',
      },
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/images/general/favicon.svg`,
        type: 'image/svg+xml',
      },
    ],
    shortcut: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/images/general/favicon.ico`,
    apple: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/images/general/favicon.svg`,
  },
  openGraph: {
    title: 'Annuaire des Prestataires de Mariage en France - Mariage Parfait',
    description: 'Trouvez rapidement les meilleurs prestataires de mariage partout en France. Photographes, traiteurs, salles de réception, fleuristes, DJ...',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/annuaire`,
    siteName: 'Mariage Parfait',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/images/general/accueil-mariage-parfait.webp`,
        width: 1200,
        height: 630,
        alt: 'Annuaire des prestataires de mariage',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Annuaire des Prestataires de Mariage en France - Mariage Parfait',
    description: 'Trouvez rapidement les meilleurs prestataires de mariage partout en France.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/images/general/accueil-mariage-parfait.webp`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'}/annuaire`,
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

export default function AnnuairePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

  // Données structurées JSON-LD pour la page annuaire
  const annuaireStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Annuaire des Prestataires de Mariage en France',
    description: 'Trouvez rapidement les meilleurs prestataires de mariage partout en France. Photographes, traiteurs, salles de réception, fleuristes, DJ...',
    url: `${baseUrl}/annuaire`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Prestataires de mariage en France',
      description: 'Liste des régions avec prestataires de mariage en France',
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
      ],
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(annuaireStructuredData) }}
      />
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-20 pb-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Annuaire des prestataires de mariage en France
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
                Trouvez rapidement les meilleurs prestataires de mariage partout en France. 
                Photographes, traiteurs, salles de réception, fleuristes, DJ... Explorez notre annuaire 
                par région et département pour contacter directement les professionnels près de chez vous.
              </p>
              <div className="text-center">
                <a
                  href="#regions"
                  className="inline-flex items-center space-x-2 bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition text-lg font-semibold"
                >
                  <span>Explorer l'annuaire</span>
                  <HiArrowRight />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Prestataires par région */}
        <section id="regions" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
              Prestataires par région
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
              {regions.map((region) => (
                <Link
                  key={region}
                  href={`/annuaire/${regionToSlug(region)}`}
                  className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-6 rounded-lg text-center font-medium transition border border-gray-300 hover:border-primary-500 shadow-sm"
                >
                  {region}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Pourquoi utiliser notre annuaire ? */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Pourquoi utiliser notre annuaire ? */}
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-8">
                  Pourquoi utiliser notre annuaire ?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <HiCheck className="text-primary-500 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Gain de temps</h3>
                      <p className="text-gray-600">
                        Toutes les entreprises de mariage réunies au même endroit.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <HiCheck className="text-primary-500 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Fiabilité</h3>
                      <p className="text-gray-600">
                        Des prestataires qualifiés et régulièrement mis à jour.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <HiCheck className="text-primary-500 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Simplicité</h3>
                      <p className="text-gray-600">
                        Navigation par région et par département.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <HiCheck className="text-primary-500 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Visibilité</h3>
                      <p className="text-gray-600">
                        Chaque fiche contient description, coordonnées et avis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment ça marche ? */}
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-8">
                  Comment ça marche ?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Choisissez votre région sur la carte de France.
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Sélectionnez votre département.
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Découvrez les prestataires locaux avec leurs fiches détaillées.
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Devenir prestataire partenaire */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Devenir prestataire partenaire
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Vous êtes professionnel du mariage ? Rejoignez notre annuaire pour augmenter votre 
              visibilité auprès de milliers de futurs mariés. Créez votre fiche, ajoutez vos photos, 
              vidéos, coordonnées et recevez directement des demandes de contact.
            </p>
            <a
              href="/espace-pro#signup"
              className="inline-flex items-center space-x-2 bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition text-lg font-semibold"
            >
              <span>Créer ma fiche prestataire</span>
              <HiArrowRight />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

