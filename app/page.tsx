import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import CategoryCard from '@/components/CategoryCard'
import ArticleCard from '@/components/ArticleCard'
import Newsletter from '@/components/Newsletter'
import AdSense from '@/components/AdSense'
import FadeInUp from '@/components/FadeInUp'
import AnimatedImage from '@/components/AnimatedImage'
import AnimatedCounter from '@/components/AnimatedCounter'
import { 
  HiPencil, 
  HiCollection, 
  HiHeart, 
  HiSparkles, 
  HiCake, 
  HiLightBulb,
  HiDocumentText,
  HiCamera,
  HiUserGroup,
  HiShoppingBag,
  HiTrendingUp,
  HiGlobeAlt,
  HiStar,
  HiUsers,
  HiCalendar,
  HiArrowRight
} from 'react-icons/hi'

const categories = [
  { icon: HiPencil, title: 'Beauté', description: 'Conseils beauté et maquillage pour votre jour J', count: 21, href: '/blog?category=beaute' },
  { icon: HiCollection, title: 'Budget', description: 'Gérer votre budget mariage efficacement', count: 35, href: '/blog?category=budget' },
  { icon: HiHeart, title: 'Cérémonie & Réception', description: 'Organiser votre cérémonie et réception', count: 42, href: '/blog?category=ceremonie-reception' },
  { icon: HiSparkles, title: 'Décoration', description: 'Idées déco pour sublimer votre mariage', count: 38, href: '/blog?category=decoration' },
  { icon: HiCake, title: 'Gastronomie', description: 'Menu et traiteur pour votre mariage', count: 28, href: '/blog?category=gastronomie' },
  { icon: HiLightBulb, title: 'Inspiration', description: 'Inspirations et idées originales', count: 45, href: '/blog?category=inspiration' },
  { icon: HiDocumentText, title: 'Papeterie & Détails', description: 'Faire-part et détails personnalisés', count: 32, href: '/blog?category=papeterie-details' },
  { icon: HiCamera, title: 'Photo & Vidéo', description: 'Capturer vos plus beaux moments', count: 29, href: '/blog?category=photo-video' },
  { icon: HiUserGroup, title: 'Prestataires', description: 'Trouver les meilleurs prestataires', count: 51, href: '/blog?category=prestataires' },
  { icon: HiShoppingBag, title: 'Robes de Mariée', description: 'Choisir la robe de vos rêves', count: 27, href: '/blog?category=robes-mariee' },
  { icon: HiTrendingUp, title: 'Tendances', description: 'Les dernières tendances mariage', count: 33, href: '/blog?category=tendances' },
  { icon: HiGlobeAlt, title: 'Voyage de Noces', description: 'Organiser votre lune de miel', count: 24, href: '/blog?category=voyage-noces' },
]

const articles = [
  {
    icon: HiTrendingUp,
    category: 'Tendances',
    title: 'Les mariages éco-responsables: Comment organiser un mariage éco-friendly et respectueux de l\'environnement',
    description: 'Découvrez comment organiser un mariage respectueux de l\'environnement avec nos conseils pratiques et nos idées éco-responsables.',
    date: '1 novembre 2020',
    readTime: '3 min',
    href: '/blog/mariages-eco-responsables'
  },
  {
    icon: HiDocumentText,
    category: 'Papeterie & Détails',
    title: 'Illuminez votre mariage avec des détails en papier doré : tendances et inspirations',
    description: 'Le papier doré apporte une touche d\'élégance et de sophistication à votre mariage. Découvrez nos idées et inspirations.',
    date: '15 octobre 2020',
    readTime: '5 min',
    href: '/blog/papier-dore-mariage'
  },
  {
    icon: HiCake,
    category: 'Gastronomie',
    title: 'Les tendances culinaires incontournables pour un mariage en 2021',
    description: 'Explorez les dernières tendances culinaires pour créer un menu de mariage mémorable et surprenant.',
    date: '10 octobre 2020',
    readTime: '4 min',
    href: '/blog/tendances-culinaires-2021'
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Section: Préparer le plus beau jour de votre vie */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <FadeInUp delay={0.1}>
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">
                    Préparer le plus beau jour de votre vie
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Mariage-Parfait vous accompagne dans l'organisation de votre mariage. 
                    Nous aidons les futurs mariés à créer une célébration qui leur ressemble, 
                    en leur offrant des conseils pratiques, des outils et un annuaire de 
                    prestataires de confiance.
                  </p>
                  <FadeInUp delay={0.3}>
                    <a
                      href="/annuaire"
                      className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
                    >
                      <span>En savoir plus</span>
                      <HiArrowRight />
                    </a>
                  </FadeInUp>
                </div>
              </FadeInUp>
              <FadeInUp delay={0.2}>
                <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                  <AnimatedImage
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Table de réception décorée"
                    className="w-full h-full"
                  />
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* Section: Explorer par Catégories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInUp>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Explorer par Catégories
                </h2>
                <p className="text-gray-600 text-lg">
                  Trouvez l'inspiration pour chaque étape de votre mariage.
                </p>
              </div>
            </FadeInUp>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <FadeInUp key={category.title} delay={index * 0.05}>
                  <CategoryCard
                    icon={category.icon}
                    title={category.title}
                    description={category.description}
                    articleCount={category.count}
                    href={category.href}
                  />
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Statistiques */}
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <FadeInUp delay={0.1}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <HiHeart className="text-primary-300 text-4xl" />
                  </div>
                  <AnimatedCounter value={6200} suffix="+" className="text-4xl font-bold text-gray-800 mb-2" />
                  <div className="text-gray-600">couples aidés</div>
                </div>
              </FadeInUp>
              <FadeInUp delay={0.2}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <HiStar className="text-primary-300 text-4xl" />
                  </div>
                  <AnimatedCounter value={310} suffix="+" className="text-4xl font-bold text-gray-800 mb-2" />
                  <div className="text-gray-600">Articles publiés</div>
                </div>
              </FadeInUp>
              <FadeInUp delay={0.3}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <HiUsers className="text-primary-300 text-4xl" />
                  </div>
                  <AnimatedCounter value={31000} suffix="+" className="text-4xl font-bold text-gray-800 mb-2" />
                  <div className="text-gray-600">lecteurs mensuels</div>
                </div>
              </FadeInUp>
              <FadeInUp delay={0.4}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <HiCalendar className="text-primary-300 text-4xl" />
                  </div>
                  <AnimatedCounter value={5} suffix="+" className="text-4xl font-bold text-gray-800 mb-2" />
                  <div className="text-gray-600">Années d'expérience</div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* Section: Trouvez les Meilleurs Prestataires */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <FadeInUp delay={0.1}>
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">
                    Trouvez les Meilleurs Prestataires pour Votre Mariage
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Notre annuaire rassemble les professionnels les plus talentueux de France. 
                    Comparez les photographes, traiteurs et lieux de réception pour dénicher 
                    les perles rares qui feront de votre journée un moment magique.
                  </p>
                  <FadeInUp delay={0.3}>
                    <a
                      href="/annuaire"
                      className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
                    >
                      <span>Consulter l'annuaire</span>
                      <HiArrowRight />
                    </a>
                  </FadeInUp>
                </div>
              </FadeInUp>
              <FadeInUp delay={0.2}>
                <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                  <AnimatedImage
                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Couple avec photographe"
                    className="w-full h-full"
                  />
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* Section: Des Guides Complets */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <FadeInUp delay={0.1}>
                <div className="relative h-96 rounded-lg overflow-hidden shadow-lg order-2 lg:order-1">
                  <AnimatedImage
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Planning et organisation"
                    className="w-full h-full"
                  />
                </div>
              </FadeInUp>
              <FadeInUp delay={0.2}>
                <div className="order-1 lg:order-2">
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">
                    Des Guides Complets pour une Organisation Sereine
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Nos articles et guides détaillés vous accompagnent de la rétro-planification 
                    à la gestion du budget, en passant par le choix de la robe de mariée et la 
                    décoration. Des conseils d'experts pour une organisation sans stress.
                  </p>
                  <FadeInUp delay={0.4}>
                    <a
                      href="/blog"
                      className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
                    >
                      <span>Découvrir le blog</span>
                      <HiArrowRight />
                    </a>
                  </FadeInUp>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* Section: Nos Derniers Articles */}
        <section className="py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <FadeInUp>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Nos Derniers Articles
                </h2>
                <p className="text-gray-600 text-lg">
                  Découvrez nos derniers conseils et inspirations pour votre mariage.
                </p>
              </div>
            </FadeInUp>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
              {/* Articles */}
              <div className="lg:col-span-2 space-y-6 w-full min-w-0 overflow-hidden">
                {articles.map((article, index) => (
                  <FadeInUp key={article.title} delay={index * 0.1}>
                    <div className="w-full min-w-0">
                      <ArticleCard
                        icon={article.icon}
                        category={article.category}
                        title={article.title}
                        description={article.description}
                        date={article.date}
                        readTime={article.readTime}
                        href={article.href}
                      />
                    </div>
                  </FadeInUp>
                ))}
                <FadeInUp delay={0.3}>
                  <div className="text-center pt-4">
                    <a
                      href="/blog"
                      className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
                    >
                      <span>Voir tous les articles</span>
                      <HiArrowRight />
                    </a>
                  </div>
                </FadeInUp>
              </div>

              {/* Sidebar: AdSense + Newsletter */}
              <div className="space-y-6 w-full min-w-0 overflow-hidden">
                {/* AdSense */}
                <div className="bg-white p-4 rounded-lg shadow-md min-h-[250px] flex items-center justify-center w-full max-w-full overflow-hidden">
                  <AdSense adSlot="4063903167" />
                </div>

                {/* Newsletter */}
                <div className="w-full max-w-full overflow-hidden">
                  <Newsletter />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: CTA Final */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeInUp delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Prêt(e) à Organiser Votre Mariage Parfait ?
              </h2>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p className="text-xl text-white mb-8">
                Rejoignez des milliers de futurs mariés qui nous font confiance pour leurs préparatifs.
              </p>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <a
                href="/espace-pro"
                className="inline-flex items-center space-x-2 bg-white text-primary-600 border-2 border-white px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
              >
                <span>Commencer maintenant</span>
                <HiArrowRight className="text-primary-600" />
              </a>
            </FadeInUp>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

