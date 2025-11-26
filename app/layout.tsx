import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

// Zalando Sans n'est pas disponible sur Google Fonts, on utilise Inter comme alternative proche
// Inter est très similaire à Zalando Sans (toutes deux sont des polices sans-serif modernes)
// Si vous avez accès à Zalando Sans via un CDN, remplacez cette configuration
const zalandoSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-zalando',
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mariage-parfait.net'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Mariage Parfait - Le guide complet pour organiser votre mariage',
    template: '%s - Mariage Parfait',
  },
  description: 'Le guide complet pour organiser une journée inoubliable, sans stress. Conseils, inspiration et annuaire de prestataires de mariage en France.',
  keywords: 'mariage, organisation mariage, conseils mariage, prestataires mariage, annuaire mariage, France',
  authors: [{ name: 'Mariage Parfait' }],
  creator: 'Mariage Parfait',
  publisher: 'Mariage Parfait',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: baseUrl,
    siteName: 'Mariage Parfait',
    title: 'Mariage Parfait - Le guide complet pour organiser votre mariage',
    description: 'Le guide complet pour organiser une journée inoubliable, sans stress. Conseils, inspiration et annuaire de prestataires de mariage en France.',
    images: [
      {
        url: `${baseUrl}/images/general/accueil-mariage-parfait.webp`,
        width: 1200,
        height: 630,
        alt: 'Mariage Parfait',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mariage Parfait - Le guide complet pour organiser votre mariage',
    description: 'Le guide complet pour organiser une journée inoubliable, sans stress.',
    images: [`${baseUrl}/images/general/accueil-mariage-parfait.webp`],
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
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      {
        url: '/images/general/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/images/general/favicon.svg',
    apple: '/images/general/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} ${zalandoSans.variable} ${poppins.className}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

