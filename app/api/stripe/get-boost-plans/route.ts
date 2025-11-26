import { NextRequest, NextResponse } from 'next/server'

// Route pour récupérer les plans de boost disponibles
// Utilise un seul price ID Stripe pour tous les plans
// Utilise STRIPE_BOOST_PRICE_ID si défini, sinon STRIPE_PRICE_ID en fallback
export async function GET(request: NextRequest) {
  // Utiliser STRIPE_BOOST_PRICE_ID si défini, sinon STRIPE_PRICE_ID
  const priceId = process.env.STRIPE_BOOST_PRICE_ID || process.env.STRIPE_PRICE_ID || ''
  
  const plans = [
    {
      id: 'boost-1',
      name: '1 fiche',
      price: 9.99,
      maxListings: 1,
      priceId: priceId, // Un seul price ID pour tous les plans
    },
    {
      id: 'boost-5',
      name: '5 fiches',
      price: 19.99,
      maxListings: 5,
      priceId: priceId, // Un seul price ID pour tous les plans
    },
    {
      id: 'boost-10',
      name: '10 fiches',
      price: 24.99,
      maxListings: 10,
      priceId: priceId, // Un seul price ID pour tous les plans
    },
  ]

  return NextResponse.json({ plans })
}

