import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Région non trouvée
          </h1>
          <p className="text-gray-600 mb-8">
            La région que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link
            href="/annuaire"
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
          >
            <span>Retour à l'annuaire</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

