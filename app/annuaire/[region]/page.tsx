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

  return (
    <div className="min-h-screen flex flex-col">
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

// Génération des métadonnées pour chaque région
export async function generateMetadata({ params }: PageProps) {
  const regionData = getRegionBySlug(params.region)

  if (!regionData) {
    return {
      title: 'Région non trouvée',
    }
  }

  return {
    title: `Prestataires de mariage en ${regionData.name} - Mariage Parfait`,
    description: `Trouvez les meilleurs prestataires de mariage dans la région ${regionData.name}. Photographes, traiteurs, salles de réception et plus encore.`,
  }
}

// Génération statique des pages pour toutes les régions
export async function generateStaticParams() {
  // Génère les slugs pour toutes les régions depuis la liste
  return regions.map((regionName) => ({
    region: regionToSlug(regionName),
  }))
}

