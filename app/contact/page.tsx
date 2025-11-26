'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { HiPaperAirplane, HiMail, HiCheckCircle, HiX } from 'react-icons/hi'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    const form = e.currentTarget || formRef.current
    if (!form) {
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(form)
    const formValues = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      request_type: formData.get('requestType') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    // Validation côté client
    if (!formValues.name || !formValues.email || !formValues.request_type || !formValues.subject || !formValues.message) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Veuillez remplir tous les champs obligatoires.' 
      })
      setIsSubmitting(false)
      return
    }

    try {
      console.log('Submitting form with values:', formValues)
      
      // Utiliser l'API route qui utilise la clé de service pour contourner RLS
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)
      
      if (!response.ok) {
        // Erreur HTTP (400, 500, etc.)
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || `Erreur ${response.status}: Une erreur est survenue lors de l'envoi de votre message.` 
        })
        console.error('API Error:', result)
        return
      }
      
      if (result.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: result.message || 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.' 
        })
        // Réinitialiser le formulaire
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.' 
        })
        console.error('Submission failed:', result)
      }
    } catch (error: any) {
      console.error('Error submitting form:', error)
      setSubmitStatus({ 
        type: 'error', 
        message: error.message || 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Titre principal */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Contactez-nous
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Notre équipe est là pour vous accompagner dans l'organisation de votre mariage parfait. 
              N'hésitez pas à nous poser vos questions !
            </p>
          </div>

          {/* Contenu en deux colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Formulaire */}
            <div className="bg-white rounded-lg p-8" style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 -10px 20px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Envoyez-nous un message
              </h2>
              
              {/* Message de statut */}
              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <HiCheckCircle className="text-xl flex-shrink-0 mt-0.5" />
                  ) : (
                    <HiX className="text-xl flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* Nom complet */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Votre nom complet"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="votre@email.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Type de demande */}
                <div>
                  <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de demande *
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="conseil">Conseil personnalisé</option>
                    <option value="support">Support technique</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="question">Question sur un article</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Sujet */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Sujet de votre message"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Décrivez votre demande en détail..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                  />
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span>Envoi en cours...</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <span>Envoyer le message</span>
                      <HiPaperAirplane className="text-xl" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Colonne droite - Informations */}
            <div className="space-y-6">
              {/* Pourquoi nous contacter ? */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Pourquoi nous contacter ?
                </h2>
                <p className="text-gray-600 mb-6">
                  Notre équipe est là pour vous accompagner dans l'organisation de votre mariage. 
                  Que vous ayez des questions sur nos articles, besoin de conseils personnalisés, 
                  ou souhaitez devenir partenaire, nous sommes à votre écoute pour vous aider à 
                  créer le mariage de vos rêves.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <span className="text-gray-700">Conseils personnalisés pour votre mariage</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <span className="text-gray-700">Support technique pour l'utilisation du site</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <span className="text-gray-700">Partenariats avec des prestataires de qualité</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <span className="text-gray-700">Questions sur nos articles et guides</span>
                  </li>
                </ul>
              </div>

              {/* Besoin d'aide immédiate ? */}
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg shadow-md p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">
                  Besoin d'aide immédiate ?
                </h2>
                <p className="mb-6 text-white/90">
                  Notre équipe support est disponible du lundi au vendredi de 9h à 18h pour répondre 
                  à toutes vos questions.
                </p>
                <a
                  href="mailto:info@mariage-parfait.net"
                  className="inline-flex items-center space-x-2 text-white hover:text-gray-100 transition"
                >
                  <HiMail className="text-xl" />
                  <span className="font-medium">info@mariage-parfait.net</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

