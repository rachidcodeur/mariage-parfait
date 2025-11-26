import Link from 'next/link'
import { HiMail } from 'react-icons/hi'
import { categoryNames } from '@/lib/categories'

export default function Footer() {
  const blogCategories = [
    { name: 'Beauté', slug: 'beaute' },
    { name: 'Cérémonie & Réception', slug: 'ceremonie-reception' },
    { name: 'Gastronomie', slug: 'gastronomie' },
    { name: 'Papeterie & Détails', slug: 'papeterie-details' },
    { name: 'Prestataires', slug: 'prestataires' },
    { name: 'Tendances', slug: 'tendances' },
    { name: 'Budget', slug: 'budget' },
    { name: 'Décoration', slug: 'decoration' },
    { name: 'Inspiration', slug: 'inspiration' },
    { name: 'Photo & Vidéo', slug: 'photo-video' },
    { name: 'Robes de Mariée', slug: 'robes-mariee' },
    { name: 'Voyage de Noces', slug: 'voyage-noces' },
  ]

  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-white font-semibold mb-4">À propos de Mariage-Parfait.net</h3>
            <p className="text-sm leading-relaxed mb-4">
              Mariage-Parfait.net est votre guide en ligne pour préparer votre mariage. 
              Nous vous accompagnons avec des conseils, de l'inspiration et un annuaire 
              de prestataires de confiance en France.
            </p>
            <a
              href="mailto:help@mariage-parfait.net"
              className="inline-flex items-center space-x-2 text-sm text-gray-300 hover:text-primary-400 transition"
            >
              <HiMail className="text-lg" />
              <span>help@mariage-parfait.net</span>
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="hover:text-primary-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="hover:text-primary-400 transition">
                  Annuaire
                </Link>
              </li>
              <li>
                <Link href="/espace-pro" className="hover:text-primary-400 transition">
                  Espace Pro
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Catégories Blog */}
          <div>
            <h3 className="text-white font-semibold mb-4">Catégories Blog</h3>
            <div className="grid grid-cols-2 gap-2">
              {blogCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog?category=${category.slug}`}
                  className="text-sm hover:text-primary-400 transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/contact" className="hover:text-primary-400 transition">
              Contact
            </Link>
            <Link href="/faq" className="hover:text-primary-400 transition">
              FAQ
            </Link>
          </div>
          <p className="text-gray-500">
            © 2024 Mariage-Parfait.net - Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

