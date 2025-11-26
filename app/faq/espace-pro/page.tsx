'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { 
  HiPlus,
  HiMinus,
  HiSparkles
} from 'react-icons/hi'

interface FAQItem {
  question: string
  answer: string
  id: string
}

const faqData: FAQItem[] = [
  {
    id: 'creer-fiche',
    question: 'Comment créer une nouvelle fiche prestataire ?',
    answer: 'Pour créer une nouvelle fiche, allez dans "Mes fiches" puis cliquez sur "Créer une fiche". Remplissez tous les champs demandés (nom, description, coordonnées, catégorie, département, etc.), ajoutez vos photos et validez. Votre fiche sera ensuite visible dans l\'annuaire après validation.'
  },
  {
    id: 'mettre-en-avant',
    question: 'Comment mettre en avant ma fiche ?',
    answer: 'Pour mettre en avant votre fiche, rendez-vous dans la section "Mise en avant" du dashboard. Choisissez un plan d\'abonnement (1, 5 ou 10 fiches) et procédez au paiement. Une fois l\'abonnement actif, vous pourrez activer la mise en avant de vos fiches directement depuis cette page.'
  },
  {
    id: 'modifier-fiche',
    question: 'Comment modifier une fiche existante ?',
    answer: 'Pour modifier une fiche, allez dans "Mes fiches", trouvez la fiche concernée et cliquez sur "Modifier". Vous pourrez alors mettre à jour toutes les informations, photos et détails de votre fiche. N\'oubliez pas de sauvegarder vos modifications.'
  },
  {
    id: 'statistiques',
    question: 'Comment voir les statistiques de mes fiches ?',
    answer: 'Les statistiques de vos fiches (vues, clics téléphone, clics site web) sont visibles sur la page principale du dashboard. Vous y trouverez un aperçu global de toutes vos fiches avec leurs performances.'
  },
  {
    id: 'revendiquer-fiche',
    question: 'Que faire si je veux revendiquer une fiche existante ?',
    answer: 'Si vous trouvez une fiche qui vous appartient déjà dans l\'annuaire, vous pouvez la revendiquer. Allez dans "Mes revendications" et suivez le processus. Vous devrez fournir des preuves (email, téléphone) et votre demande sera examinée par notre équipe.'
  },
  {
    id: 'gerer-abonnement',
    question: 'Comment gérer mon abonnement ?',
    answer: 'Vous pouvez gérer votre abonnement dans la section "Mise en avant" du dashboard. Vous y trouverez les informations sur votre plan actif, la possibilité d\'annuler ou de reprendre votre abonnement, et de synchroniser vos données avec Stripe si nécessaire.'
  },
  {
    id: 'supprimer-fiche',
    question: 'Comment supprimer une fiche ?',
    answer: 'Pour supprimer une fiche, allez dans "Mes fiches", trouvez la fiche concernée et cliquez sur l\'icône de suppression (poubelle). Une confirmation vous sera demandée avant la suppression définitive.'
  },
  {
    id: 'contacter-support',
    question: 'Comment contacter le support ?',
    answer: 'Pour toute question ou problème, vous pouvez nous contacter via la page "Contact" du site. Nous répondrons à votre demande dans les plus brefs délais.'
  }
]

export default function FAQEspaceProPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({})

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  // Ouvrir automatiquement l'item si un hash est présent dans l'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setOpenItems(prev => ({
          ...prev,
          [hash]: true
        }))
        // Scroll vers l'élément après un court délai
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              FAQ - Espace Pro
            </h1>
            <p className="text-lg text-gray-600 font-poppins">
              Retrouvez ici les réponses aux questions les plus fréquentes concernant votre espace prestataire.
            </p>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6">
            <div className="space-y-4">
              {faqData.map((item) => {
                const isOpen = openItems[item.id] || false
                
                return (
                  <div
                    key={item.id}
                    id={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md scroll-mt-20"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="font-semibold text-gray-900 pr-4 font-poppins break-words">
                        {item.question}
                      </span>
                      <div className="flex-shrink-0">
                        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                          {isOpen ? (
                            <HiMinus className="w-6 h-6 text-primary-500" />
                          ) : (
                            <HiPlus className="w-6 h-6 text-primary-500" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed font-poppins font-normal break-words">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Une autre question ?</h2>
              <p className="text-gray-600 mb-6 font-poppins">
                Si vous n'avez pas trouvé la réponse à votre question, n'hésitez pas à nous contacter directement.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold"
              >
                <span>Contactez-nous</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

