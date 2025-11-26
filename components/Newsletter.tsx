'use client'

import { useState } from 'react'
import { HiCheckCircle, HiX } from 'react-icons/hi'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'homepage' // ou détecter la page d'origine
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: result.error || 'Une erreur est survenue lors de l\'abonnement.'
        })
        return
      }

      if (result.success) {
        setStatus({
          type: 'success',
          message: result.message || 'Merci pour votre abonnement !'
        })
        setEmail('')
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Une erreur est survenue lors de l\'abonnement.'
        })
      }
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error)
      setStatus({
        type: 'error',
        message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-primary-500 p-6 rounded-lg w-full max-w-full overflow-hidden">
      <h3 className="text-white text-xl font-semibold mb-3 break-words">Newsletter</h3>
      <p className="text-white text-sm mb-4 break-words">
        Recevez nos meilleurs conseils mariage directement dans votre boîte mail.
      </p>
      
      {/* Message de statut */}
      {status.type && (
        <div
          className={`p-3 rounded-lg mb-4 flex items-start space-x-2 text-sm ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <HiCheckCircle className="text-lg flex-shrink-0 mt-0.5" />
          ) : (
            <HiX className="text-lg flex-shrink-0 mt-0.5" />
          )}
          <p className="text-xs break-words">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          disabled={isSubmitting}
          className="w-full max-w-full px-4 py-2 rounded-lg mb-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white box-border disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full max-w-full bg-white text-primary-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold box-border disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <span>Inscription...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            </>
          ) : (
            <span>S'abonner</span>
          )}
        </button>
      </form>
    </div>
  )
}

