// Script pour générer des articles en batch
// Usage: node scripts/generate-batch-articles.js
// Note: Ce script nécessite que le serveur Next.js soit en cours d'exécution
// Démarrez-le avec: npm run dev

const allCategories = [
  'robes-mariee',
  'beaute',
  'budget',
  'ceremonie-reception',
  'decoration',
  'gastronomie',
  'inspiration',
  'papeterie-details',
  'photo-video',
  'prestataires',
  'tendances',
  'voyage-noces',
]

async function generateBatchArticlesViaAPI(startDate, endDate, force = false) {
  const url = 'http://localhost:3000/api/articles/generate-batch'
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      force
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  return await response.json()
}

async function main() {
  const startDate = new Date('2024-11-02')
  const endDate = new Date('2024-11-26')
  const force = process.argv.includes('--force')

  console.log('🚀 Génération des articles en batch')
  console.log(`📅 Période: ${startDate.toISOString().split('T')[0]} au ${endDate.toISOString().split('T')[0]}`)
  console.log(`📊 ${allCategories.length} catégories\n`)

  if (force) {
    console.log('⚠️  Mode FORCE activé: les articles existants seront remplacés\n')
  }

  try {
    // Vérifier que le serveur est accessible
    const testResponse = await fetch('http://localhost:3000/api/articles/generate-batch', {
      method: 'GET'
    }).catch(() => null)

    if (!testResponse || !testResponse.ok) {
      console.error('❌ Le serveur Next.js n\'est pas accessible sur http://localhost:3000')
      console.error('   Veuillez démarrer le serveur avec: npm run dev')
      process.exit(1)
    }

    console.log('⏳ Génération en cours... (cela peut prendre plusieurs minutes)\n')
    const result = await generateBatchArticlesViaAPI(startDate, endDate, force)

    console.log('\n✅ Génération terminée!')
    console.log(`📊 Résumé:`)
    console.log(`   - Articles créés: ${result.summary.totalCreated}`)
    console.log(`   - Articles ignorés (déjà existants): ${result.summary.totalSkipped}`)
    console.log(`   - Erreurs: ${result.summary.totalErrors}`)
    console.log(`   - Total traité: ${result.summary.totalProcessed}`)

    if (result.summary.totalErrors > 0) {
      console.log('\n⚠️  Certains articles n\'ont pas pu être créés.')
      process.exit(1)
    } else {
      console.log('\n🎉 Tous les articles ont été générés avec succès!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to connect')) {
      console.error('\n💡 Solution: Démarrez le serveur Next.js avec: npm run dev')
    }
    process.exit(1)
  }
}

main()

