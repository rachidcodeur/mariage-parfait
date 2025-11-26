import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import AdSense from '@/components/AdSense'
import ArticleCard from '@/components/ArticleCard'
import TableOfContents from '@/components/TableOfContents'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/supabase'
import { categoryIdToSlug, categoryNames } from '@/lib/categories'
import { HiCalendar, HiClock, HiUser, HiPencil, HiCollection, HiHeart, HiSparkles, HiCake, HiTrendingUp, HiDocumentText, HiCamera, HiShoppingBag, HiGlobeAlt } from 'react-icons/hi'

const categoryIconsMap: Record<string, any> = {
  beaute: HiPencil,
  budget: HiCollection,
  'ceremonie-reception': HiHeart,
  decoration: HiSparkles,
  gastronomie: HiCake,
  inspiration: HiTrendingUp,
  'papeterie-details': HiDocumentText,
  'photo-video': HiCamera,
  prestataires: HiShoppingBag,
  'robes-mariee': HiShoppingBag,
  tendances: HiTrendingUp,
  'voyage-noces': HiGlobeAlt,
}

interface PageProps {
  params: {
    slug: string
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const categorySlug = categoryIdToSlug[article.category_id] || 'inspiration'
  const categoryName = categoryNames[categorySlug] || 'Article'
  const Icon = categoryIconsMap[categorySlug] || HiDocumentText

  // Récupérer les articles similaires (même catégorie)
  const relatedArticles = await getArticles(categorySlug, 3, 0)
  const filteredRelated = relatedArticles.filter(a => a.slug !== article.slug).slice(0, 3)

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Extraire les titres de sections du contenu HTML pour la table des matières
  const extractTableOfContents = (html: string) => {
    const regex = /<h2[^>]*>(.*?)<\/h2>/gi
    const matches = Array.from(html.matchAll(regex))
    return matches.map(match => {
      const titleText = match[1].replace(/<[^>]*>/g, '')
      const id = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      return {
        id,
        title: titleText,
      }
    })
  }

  // Ajouter des IDs aux titres h2 dans le contenu HTML
  const addIdsToHeadings = (html: string) => {
    const toc = extractTableOfContents(html)
    let processedHtml = html
    
    toc.forEach((item) => {
      // Chercher les balises h2 qui contiennent le titre
      const escapedTitle = item.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`<h2([^>]*)>${escapedTitle}<\/h2>`, 'gi')
      processedHtml = processedHtml.replace(
        regex,
        (match, attributes) => {
          // Vérifier si l'ID existe déjà
          if (attributes && attributes.includes(`id="${item.id}"`)) {
            return match
          }
          // Ajouter l'ID et la classe scroll-margin
          const existingClass = attributes && attributes.match(/class="([^"]*)"/)
          const classAttr = existingClass 
            ? `class="${existingClass[1]} scroll-mt-24"`
            : 'class="scroll-mt-24"'
          const otherAttrs = attributes ? attributes.replace(/class="[^"]*"/, '').trim() : ''
          return `<h2 id="${item.id}" ${classAttr} ${otherAttrs}>${item.title}</h2>`
        }
      )
    })
    
    return processedHtml
  }

  const tableOfContents = extractTableOfContents(article.content)
  const contentWithIds = addIdsToHeadings(article.content)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'
  const articleUrl = `${baseUrl}/blog/${article.slug}`

  // Données structurées JSON-LD pour l'article
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.meta_description || article.excerpt,
    image: article.content?.match(/<img[^>]+src="([^"]+)"/i)?.[1] || `${baseUrl}/images/general/accueil-mariage-parfait.webp`,
    datePublished: article.created_at,
    dateModified: article.created_at,
    author: {
      '@type': 'Organization',
      name: 'Mariage Parfait',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mariage Parfait',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: categoryName,
    keywords: article.keywords || 'mariage, organisation mariage',
    wordCount: article.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <Header />

      <main className="flex-grow">
        {/* Article Content */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar - Table des matières */}
              <aside className="lg:col-span-1">
                <TableOfContents items={tableOfContents} />
              </aside>

              {/* Main Content */}
              <article className="lg:col-span-3">
                {/* Article Header */}
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                    {article.title}
                  </h1>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center space-x-1">
                      <HiCalendar className="text-gray-400" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HiClock className="text-gray-400" />
                      <span>{article.read_time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HiUser className="text-gray-400" />
                      <span>& L'équipe Mariage Parfait</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-500 text-sm font-medium">
                      {categoryName}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div 
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: contentWithIds }}
                />

                {/* Encart Publicitaire - Bien visible au milieu du contenu */}
                <div className="my-16 flex justify-center">
                  <div className="w-full max-w-4xl border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <AdSense adSlot="4138966929" />
                  </div>
                </div>

                {/* CTA Banner */}
                <div className="bg-primary-500 rounded-2xl p-8 md:p-12 text-white mb-12 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Trouvez les Prestataires pour votre Mariage
                  </h2>
                  <p className="text-lg mb-6 opacity-90 max-w-3xl mx-auto">
                    Vous cherchez des professionnels pour donner vie à votre journée de rêve ? Découvrez notre annuaire complet de prestataires de mariage, disponible partout en France. Nous avons sélectionné pour vous les meilleurs experts pour chaque étape de votre grand jour.
                  </p>
                  <Link
                    href="/annuaire"
                    className="inline-block bg-white text-primary-500 px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold"
                  >
                    Consulter l'annuaire
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {filteredRelated.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Articles suivants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRelated.map((relatedArticle) => {
                  const relatedCategorySlug = categoryIdToSlug[relatedArticle.category_id] || 'inspiration'
                  const relatedCategoryName = categoryNames[relatedCategorySlug] || 'Article'
                  const RelatedIcon = categoryIconsMap[relatedCategorySlug] || HiDocumentText
                  
                  return (
                    <ArticleCard
                      key={relatedArticle.id}
                      icon={RelatedIcon}
                      category={relatedCategoryName}
                      title={relatedArticle.title}
                      description={relatedArticle.excerpt}
                      date={formatDate(relatedArticle.created_at)}
                      readTime={relatedArticle.read_time}
                      href={`/blog/${relatedArticle.slug}`}
                    />
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

// Génération des métadonnées SEO
export async function generateMetadata({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

  if (!article) {
    return {
      title: 'Article non trouvé - Mariage Parfait',
    }
  }

  const categorySlug = categoryIdToSlug[article.category_id] || 'inspiration'
  const categoryName = categoryNames[categorySlug] || 'Article'
  const articleUrl = `${baseUrl}/blog/${article.slug}`
  const description = article.meta_description || article.excerpt || 'Découvrez nos conseils pour organiser votre mariage parfait'

  // Extraire la première image du contenu si disponible
  const imageMatch = article.content?.match(/<img[^>]+src="([^"]+)"/i)
  const imageUrl = imageMatch 
    ? imageMatch[1].startsWith('http') 
      ? imageMatch[1] 
      : `${baseUrl}${imageMatch[1]}`
    : `${baseUrl}/images/general/accueil-mariage-parfait.webp`

  return {
    title: `${article.title} - Mariage Parfait`,
    description,
    keywords: article.keywords || 'mariage, organisation mariage, conseils mariage',
    authors: [{ name: 'Mariage Parfait' }],
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      siteName: 'Mariage Parfait',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      locale: 'fr_FR',
      type: 'article',
      publishedTime: article.created_at,
      modifiedTime: article.created_at,
      section: categoryName,
      tags: article.keywords?.split(',').map(k => k.trim()) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: articleUrl,
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

