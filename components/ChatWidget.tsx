'use client'

import { useState, useRef, useEffect } from 'react'
import { HiChat, HiX, HiPaperAirplane } from 'react-icons/hi'


interface FAQItem {
  question: string
  answer: string
  anchorId: string
}

interface Message {
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  id?: string // ID pour l'ancre
}

const faqQuestions: FAQItem[] = [
  {
    question: 'Comment créer une nouvelle fiche prestataire ?',
    answer: 'Pour créer une nouvelle fiche, allez dans "Mes fiches" puis cliquez sur "Créer une fiche". Remplissez tous les champs demandés (nom, description, coordonnées, catégorie, département, etc.), ajoutez vos photos et validez. Votre fiche sera ensuite visible dans l\'annuaire après validation.',
    anchorId: 'creer-fiche'
  },
  {
    question: 'Comment mettre en avant ma fiche ?',
    answer: 'Pour mettre en avant votre fiche, rendez-vous dans la section "Mise en avant" du dashboard. Choisissez un plan d\'abonnement (1, 5 ou 10 fiches) et procédez au paiement. Une fois l\'abonnement actif, vous pourrez activer la mise en avant de vos fiches directement depuis cette page.',
    anchorId: 'mettre-en-avant'
  },
  {
    question: 'Comment modifier une fiche existante ?',
    answer: 'Pour modifier une fiche, allez dans "Mes fiches", trouvez la fiche concernée et cliquez sur "Modifier". Vous pourrez alors mettre à jour toutes les informations, photos et détails de votre fiche. N\'oubliez pas de sauvegarder vos modifications.',
    anchorId: 'modifier-fiche'
  },
  {
    question: 'Comment voir les statistiques de mes fiches ?',
    answer: 'Les statistiques de vos fiches (vues, clics téléphone, clics site web) sont visibles sur la page principale du dashboard. Vous y trouverez un aperçu global de toutes vos fiches avec leurs performances.',
    anchorId: 'statistiques'
  },
  {
    question: 'Que faire si je veux revendiquer une fiche existante ?',
    answer: 'Si vous trouvez une fiche qui vous appartient déjà dans l\'annuaire, vous pouvez la revendiquer. Allez dans "Mes revendications" et suivez le processus. Vous devrez fournir des preuves (email, téléphone) et votre demande sera examinée par notre équipe.',
    anchorId: 'revendiquer-fiche'
  },
  {
    question: 'Comment gérer mon abonnement ?',
        answer: 'Vous pouvez gérer votre abonnement dans la section "Mise en avant" du dashboard. Vous y trouverez les informations sur votre plan actif, la possibilité d\'annuler ou de reprendre votre abonnement, et de synchroniser vos données avec Stripe si nécessaire.',
    anchorId: 'gerer-abonnement'
  },
  {
    question: 'Comment supprimer une fiche ?',
    answer: 'Pour supprimer une fiche, allez dans "Mes fiches", trouvez la fiche concernée et cliquez sur l\'icône de suppression (poubelle). Une confirmation vous sera demandée avant la suppression définitive.',
    anchorId: 'supprimer-fiche'
  },
  {
    question: 'Comment contacter le support ?',
    answer: 'Pour toute question ou problème, vous pouvez nous contacter via la page "Contact" du site. Nous répondrons à votre demande dans les plus brefs délais.',
    anchorId: 'contacter-support'
  }
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isAskingName, setIsAskingName] = useState(true)
  const [showQuestions, setShowQuestions] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const answerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showQuestions])

  // Fonction pour scroller vers une réponse spécifique
  const scrollToAnswer = (anchorId: string) => {
    setTimeout(() => {
      const element = answerRefs.current[anchorId]
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  // Focus sur l'input du prénom quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && isAskingName && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [isOpen, isAskingName])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = nameInputRef.current?.value.trim() || ''
    if (name) {
      setUserName(name)
      setIsAskingName(false)
      setShowQuestions(true)
      setMessages([
        {
          type: 'bot',
          content: `Bonjour ${name} ! Je suis Lino, votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?`,
          timestamp: new Date()
        }
      ])
    }
  }

  const handleQuestionClick = (faqItem: FAQItem) => {
    // Ajouter la question de l'utilisateur
    const userMsg: Message = {
      type: 'user',
      content: faqItem.question,
      timestamp: new Date()
    }

    // Ajouter la réponse du bot avec un ID pour l'ancre
    const botMessage: Message = {
      type: 'bot',
      content: faqItem.answer,
      timestamp: new Date(),
      id: faqItem.anchorId
    }

    setMessages(prev => [...prev, userMsg, botMessage])
    setShowQuestions(true) // Réafficher les questions après la réponse

    // Scroller vers la réponse dans le chat
    scrollToAnswer(faqItem.anchorId)
  }

  const handleUserMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const message = userMessage.trim()
    if (!message) return

    // Ajouter le message de l'utilisateur
    const userMsg: Message = {
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setUserMessage('')
    setShowQuestions(false) // Masquer les questions quand l'utilisateur envoie un message

    // Réponse générique de Lino
    setTimeout(() => {
      const botMessage: Message = {
        type: 'bot',
        content: `Merci pour votre message, ${userName} ! Je suis là pour vous aider avec les questions fréquentes. N'hésitez pas à cliquer sur une des questions ci-dessous pour obtenir une réponse détaillée.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setShowQuestions(true) // Réafficher les questions après la réponse
    }, 500)
  }

  const handleClose = () => {
    setIsOpen(false)
    // Réinitialiser l'état si on ferme complètement
    setTimeout(() => {
      setUserName('')
      setMessages([])
      setIsAskingName(true)
      setShowQuestions(false)
    }, 300)
  }

  return (
    <>
      {/* Bouton flottant avec animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[42px] right-[47px] z-50 w-16 h-16 bg-dashboard-primary rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Ouvrir le chat"
      >
        {/* Animation de vague en boucle */}
        <div className="absolute inset-0 rounded-full chat-pulse"></div>
        <div className="absolute inset-0 rounded-full chat-pulse-delayed"></div>
        
        {/* Icône */}
        <HiChat className="text-2xl relative z-10" />
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-dashboard-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-dashboard-primary text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <HiChat className="text-lg" />
              </div>
              <div>
                <h3 className="font-semibold">Lino</h3>
                <p className="text-xs text-white/80">Assistant virtuel</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-white/80 transition"
              aria-label="Fermer le chat"
            >
              <HiX className="text-xl" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-dashboard-bg-secondary min-h-0">
            {/* Messages existants */}
            {messages.map((message, index) => (
              <div
                key={index}
                id={message.id ? `answer-${message.id}` : undefined}
                ref={message.id ? (el) => { answerRefs.current[message.id!] = el } : undefined}
                className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''} scroll-mt-4`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'bot' 
                    ? 'bg-dashboard-primary/10' 
                    : 'bg-dashboard-primary'
                }`}>
                  {message.type === 'bot' ? (
                    <HiChat className="text-dashboard-primary text-sm" />
                  ) : (
                    <span className="text-white text-xs font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={`flex-1 min-w-0 ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`rounded-lg p-3 shadow-sm border ${
                    message.type === 'bot'
                      ? 'bg-white border-dashboard-border'
                      : 'bg-dashboard-primary text-white border-dashboard-primary'
                  }`}>
                    <p className={`text-sm break-words ${message.type === 'bot' ? 'dashboard-text' : 'text-white'}`}>
                      {message.content}
                    </p>
                  </div>
                  <span className="dashboard-text-secondary text-xs mt-1 block">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Demande du prénom */}
            {isAskingName && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-dashboard-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiChat className="text-dashboard-primary text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-dashboard-border">
                    <p className="dashboard-text text-sm mb-3 break-words">
                      Bonjour ! Je suis Lino, votre assistant virtuel. Quel est votre prénom ?
                    </p>
                    <form onSubmit={handleNameSubmit} className="flex gap-2">
                      <input
                        ref={nameInputRef}
                        type="text"
                        placeholder="Votre prénom"
                        className="flex-1 dashboard-input text-sm min-w-0"
                        required
                      />
                      <button
                        type="submit"
                        className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center transition flex-shrink-0"
                        aria-label="Valider"
                      >
                        <HiPaperAirplane className="text-lg" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Questions FAQ */}
            {showQuestions && !isAskingName && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-dashboard-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <HiChat className="text-dashboard-primary text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-dashboard-border">
                      <p className="dashboard-text text-sm font-semibold mb-3 break-words">
                        Voici les questions que je peux vous aider à résoudre :
                      </p>
                      <div className="space-y-2">
                        {faqQuestions.map((faqItem, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuestionClick(faqItem)}
                            className="w-full text-left p-3 bg-primary-500 hover:bg-primary-600 border border-primary-500 rounded-lg transition text-sm text-white break-words"
                          >
                            {faqItem.question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input pour les messages utilisateur */}
          {!isAskingName && (
            <div className="p-4 border-t border-dashboard-border bg-white flex-shrink-0">
              <form onSubmit={handleUserMessageSubmit} className="flex gap-2">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 dashboard-input text-sm rounded-lg min-w-0"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  disabled={!userMessage.trim()}
                  aria-label="Envoyer"
                >
                  <HiPaperAirplane className="text-lg" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  )
}
