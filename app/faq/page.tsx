'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { 
  HiCalendar, 
  HiCurrencyEuro, 
  HiPencil, 
  HiSparkles, 
  HiFire,
  HiGlobeAlt,
  HiDotsHorizontal,
  HiPlus,
  HiMinus
} from 'react-icons/hi'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  icon: any
  title: string
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    icon: HiCalendar,
    title: 'Organisation',
    items: [
      {
        question: 'Quand commencer à organiser son mariage ?',
        answer: 'Il est recommandé de commencer à organiser votre mariage 12 à 18 mois à l\'avance. Cela vous laisse le temps de réserver les prestataires les plus demandés (photographe, traiteur, lieu de réception), de planifier sereinement tous les détails, et d\'éviter le stress de dernière minute. Pour les mariages en haute saison (mai-juin, septembre), prévoyez même 18 à 24 mois à l\'avance.'
      },
      {
        question: 'Quels prestataires réserver en priorité ?',
        answer: 'Les prestataires à réserver en priorité sont : 1) Le lieu de réception (salles, châteaux, espaces événementiels) - souvent réservés 12-18 mois à l\'avance, 2) Le photographe/vidéaste - les meilleurs sont très demandés, 3) Le traiteur - essentiel pour la qualité de votre réception, 4) La robe de mariée - les essayages et retouches prennent du temps. Ensuite viennent les autres prestataires comme le DJ, le fleuriste, le maquilleur, etc.'
      },
      {
        question: 'Quelles sont les checklists indispensables ?',
        answer: 'Les checklists essentielles incluent : la liste des invités, le budget détaillé, la réservation des prestataires, les démarches administratives (mairie, passeport si voyage), la liste de mariage, les faire-part et invitations, la décoration et le thème, la playlist musicale, le planning du jour J, et la liste des accessoires (bagues, alliances, livre d\'or, etc.). Utilisez des applications ou tableurs pour suivre l\'avancement de chaque tâche.'
      }
    ]
  },
  {
    icon: HiCurrencyEuro,
    title: 'Budget',
    items: [
      {
        question: 'Quel est le budget moyen en France ?',
        answer: 'Le budget moyen d\'un mariage en France se situe entre 10 000€ et 15 000€ pour 50 à 80 invités. Cependant, ce montant varie considérablement selon la région, le nombre d\'invités, et le niveau de prestation souhaité. Un mariage haut de gamme peut facilement atteindre 30 000€ à 50 000€ ou plus. Il est important d\'établir votre budget dès le départ et de le répartir intelligemment entre les différents postes.'
      },
      {
        question: 'Comment économiser sans sacrifier le style ?',
        answer: 'Plusieurs astuces permettent d\'économiser sans compromettre l\'élégance : choisir une date hors saison (hiver, début d\'année), opter pour un vendredi ou dimanche plutôt que samedi, réduire le nombre d\'invités, privilégier les fleurs de saison, négocier des packages avec les prestataires, faire appel à des prestataires émergents talentueux, organiser un cocktail dinatoire plutôt qu\'un repas assis, et faire certains éléments vous-même (décoration, centre de table).'
      },
      {
        question: 'Les acomptes sont-ils remboursables ?',
        answer: 'Généralement, les acomptes versés aux prestataires ne sont pas remboursables, sauf cas de force majeure ou clause contractuelle spécifique. C\'est pourquoi il est crucial de bien lire les conditions générales avant de signer. Certains prestataires acceptent un report de date en cas d\'annulation, mais cela dépend de leur disponibilité. Assurez-vous de souscrire une assurance annulation mariage pour vous protéger en cas d\'imprévu majeur.'
      }
    ]
  },
  {
    icon: HiPencil,
    title: 'Prestataires & Animation',
    items: [
      {
        question: 'Comment choisir son photographe ?',
        answer: 'Pour choisir votre photographe, commencez par consulter son portfolio pour vérifier que son style correspond à vos attentes (romantique, moderne, naturel, etc.). Rencontrez-le en personne pour évaluer sa personnalité et sa capacité à mettre à l\'aise. Vérifiez les avis clients et demandez des références. Comparez les packages (nombre de photos, durée de couverture, album inclus). Enfin, assurez-vous que la chimie passe bien, car il sera présent toute la journée.'
      },
      {
        question: 'Faut-il goûter le menu du traiteur ?',
        answer: 'Absolument ! La dégustation est essentielle pour valider le choix des plats, vérifier les quantités, discuter des options végétariennes/végétaliennes, et s\'assurer que le traiteur comprend vos attentes. C\'est aussi l\'occasion de finaliser les détails (service, présentation, timing). Prévoyez la dégustation 2-3 mois avant le mariage. N\'hésitez pas à demander des modifications si quelque chose ne vous convient pas.'
      },
      {
        question: 'Des idées d\'animations inter-générations ?',
        answer: 'Pour animer votre mariage et plaire à tous les âges, pensez à : un photomaton avec accessoires, un jeu de piste ou chasse au trésor, un atelier créatif (création de badges, fresque collective), un coin jeux de société, une piste de danse avec musiques variées (des années 60 à aujourd\'hui), un karaoké, un concours de danse, ou encore un mur de messages pour les invités. L\'idée est de créer des moments de convivialité qui rassemblent toutes les générations.'
      }
    ]
  },
  {
    icon: HiSparkles,
    title: 'Tenues & Beauté',
    items: [
      {
        question: 'Quand acheter la robe de mariée ?',
        answer: 'Il est recommandé d\'acheter ou de commander votre robe de mariée 6 à 9 mois avant le mariage. Cela laisse le temps pour les essayages, les retouches (souvent 2 à 3 séances), et les ajustements de dernière minute. Si vous commandez une robe sur mesure, prévoyez même 9 à 12 mois. N\'oubliez pas de prévoir aussi les accessoires (voile, chaussures, bijoux) et les retouches finales 1 mois avant le jour J.'
      },
      {
        question: 'Coiffure/maquillage : quand faire les essais ?',
        answer: 'Planifiez les essais coiffure et maquillage 1 à 2 mois avant le mariage. Cela vous permet de tester différents looks, de valider celui qui vous plaît, et de laisser le temps au professionnel de noter vos préférences. Apportez des photos d\'inspiration, votre robe (ou une photo), et les accessoires prévus. Prévoyez aussi un essai avec votre tenue de répétition si possible. Le jour J, le professionnel saura exactement ce que vous souhaitez.'
      },
      {
        question: 'Chaussures : confort ou esthétique ?',
        answer: 'L\'idéal est de trouver le bon équilibre ! Privilégiez le confort car vous porterez ces chaussures toute la journée. Optez pour des talons de 5-7 cm maximum si vous n\'êtes pas habituée, ou des talons plats/escarpins bas pour plus de confort. Testez-les avant le mariage pour les "casser". Ayez aussi une paire de chaussures plates de secours pour la soirée. De nombreuses marques proposent des modèles élégants et confortables - ne sacrifiez pas votre bien-être pour la beauté !'
      }
    ]
  },
  {
    icon: HiFire,
    title: 'Jour J & Invités',
    items: [
      {
        question: 'Faut-il prévoir un plan B en cas de pluie ?',
        answer: 'Oui, absolument ! Même si vous espérez un temps magnifique, prévoir un plan B est essentiel pour éviter le stress. Discutez avec votre lieu de réception des options en cas de mauvais temps (tente, espace couvert, salle de repli). Pour les cérémonies extérieures, prévoyez des parapluies élégants, une tente ou un espace couvert. Informez vos invités du plan B dans les invitations. Cela vous permettra de profiter sereinement de votre journée, quel que soit le temps.'
      },
      {
        question: 'Quel est le timing idéal pour le Jour J ?',
        answer: 'Un timing type pour un mariage classique : 14h-15h cérémonie (civile ou religieuse), 15h-16h30 séance photo et cocktail, 16h30-17h entrée dans la salle, 17h-19h repas, 19h-20h coupe de gâteau et danses d\'ouverture, 20h-2h soirée dansante. Adaptez selon vos préférences (mariage en extérieur, brunch, etc.). L\'important est de prévoir des temps de transition et de ne pas surcharger le planning pour laisser place à l\'imprévu et à la spontanéité.'
      },
      {
        question: 'Comment gérer les invités venant de loin ?',
        answer: 'Pour vos invités venant de loin, pensez à : leur fournir une liste d\'hôtels recommandés à proximité, négocier des tarifs de groupe si possible, organiser un transport depuis la gare/aéroport, prévoir un brunch ou déjeuner le lendemain pour prolonger les retrouvailles, créer un groupe WhatsApp ou un site dédié avec toutes les infos pratiques (itinéraires, hébergements, activités locales), et les remercier chaleureusement pour leur présence. Leur faciliter le voyage montre votre attention.'
      }
    ]
  },
  {
    icon: HiGlobeAlt,
    title: 'Voyage de noces',
    items: [
      {
        question: 'Quand partir en voyage de noces ?',
        answer: 'Il n\'y a pas de règle absolue ! Certains couples partent immédiatement après le mariage, d\'autres préfèrent attendre quelques semaines ou mois pour mieux profiter et éviter la fatigue post-mariage. L\'avantage de partir juste après : l\'euphorie du mariage, pas de retour au travail immédiat. L\'avantage d\'attendre : récupérer de l\'organisation, profiter des offres hors saison, et avoir plus de temps pour planifier. Choisissez selon votre situation et vos préférences.'
      },
      {
        question: 'Quelles sont les meilleures destinations pour 7-10 jours ?',
        answer: 'Pour un voyage de 7-10 jours, voici des destinations idéales : les Maldives ou les Seychelles pour le dépaysement et la détente, la Grèce (Santorini, Mykonos) pour le romantisme, l\'Italie (Amalfi, Toscane) pour la culture et la gastronomie, le Portugal (Algarve, Lisbonne) pour l\'authenticité, le Maroc pour l\'exotisme proche, ou encore la Thaïlande pour l\'aventure. Choisissez selon votre budget, vos envies (farniente vs découverte), et la saison. L\'important est de se faire plaisir ensemble !'
      }
    ]
  },
  {
    icon: HiDotsHorizontal,
    title: 'Divers',
    items: [
      {
        question: 'Mariage éco-responsable, par où commencer ?',
        answer: 'Pour organiser un mariage éco-responsable, commencez par : choisir un lieu accessible en transport en commun, privilégier les prestataires locaux, opter pour des fleurs de saison et locales, réduire le gaspillage alimentaire (buffet raisonné), éviter le plastique (vaisselle réutilisable, gourdes), choisir des faire-part en papier recyclé ou numériques, offrir des cadeaux utiles et durables, et compenser l\'empreinte carbone si possible. Chaque petit geste compte !'
      },
      {
        question: 'Quels textes pour les faire-part et les relances RSVP ?',
        answer: 'Pour les faire-part, soyez clairs sur les informations essentielles : date, heure, lieu, code vestimentaire, et date limite de réponse. Pour les relances RSVP (envoyées 2-3 semaines avant la date limite), restez polis et bienveillants : "Nous espérons vous compter parmi nous pour notre mariage. Pourriez-vous nous confirmer votre présence avant le [date] ? Cela nous aiderait grandement dans l\'organisation. Merci !" Ajoutez un lien de réponse simple ou un numéro de téléphone.'
      },
      {
        question: 'Comment bien briefer les témoins ?',
        answer: 'Pour bien briefer vos témoins, organisez une réunion quelques semaines avant le mariage pour leur expliquer : leur rôle le jour J (gestion des alliances, signature du registre, organisation des invités), le déroulé de la journée, les contacts importants (traiteur, photographe, etc.), les points de vigilance (timing, gestion du stress), et les éventuelles responsabilités (discours, animation). Donnez-leur un document récapitulatif. Ils sont vos alliés pour que tout se passe bien !'
      }
    ]
  }
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({})

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Foire Aux Questions (FAQ)
            </h1>
            <p className="text-lg text-gray-600 font-poppins">
              Retrouvez ici les réponses aux questions les plus fréquentes des futurs mariés.
            </p>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6">
            <div className="space-y-8">
              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                      <category.icon className="text-primary-500 text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => {
                      const key = `${categoryIndex}-${itemIndex}`
                      const isOpen = openItems[key] || false
                      // Créer un ID unique pour l'ancre basé sur la question
                      const questionId = `faq-${categoryIndex}-${itemIndex}-${item.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}`
                      
                      return (
                        <div
                          key={itemIndex}
                          id={questionId}
                          className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md scroll-mt-20"
                        >
                          <button
                            onClick={() => toggleItem(categoryIndex, itemIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors duration-200"
                          >
                            <span className="font-semibold text-gray-900 pr-4 font-poppins">
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
                              <p className="text-gray-700 leading-relaxed font-poppins font-normal">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
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

