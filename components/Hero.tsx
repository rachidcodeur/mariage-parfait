import Link from 'next/link'
import { HiArrowRight } from 'react-icons/hi'

export default function Hero() {
  return (
    <section className="relative h-[600px] flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/general/accueil-mariage-parfait.webp)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Votre Mariage, Votre Rêve
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Le guide complet pour organiser une journée inoubliable, sans stress.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition text-lg font-semibold"
        >
          <span>Découvrir le blog</span>
          <HiArrowRight className="text-xl" />
        </Link>
      </div>
    </section>
  )
}

