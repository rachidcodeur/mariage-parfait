import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any,
  typescript: true,
})

// ID du prix Stripe pour l'abonnement mensuel à 9.99€
// Vous devrez créer ce prix dans Stripe et mettre à jour cette constante
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ''

// Montant en centimes (9.99€ = 999 centimes)
export const SUBSCRIPTION_AMOUNT = 999

// Devise
export const CURRENCY = 'eur'

