import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Article non trouvé</h1>
          <p className="text-gray-600 mb-8">
            L'article que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            href="/blog"
            className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition"
          >
            Retour au blog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

