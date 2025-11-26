# Génération d'articles en batch

Ce guide explique comment générer des articles de blog en masse pour une période donnée.

## Route API

La route `/api/articles/generate-batch` permet de générer des articles pour toutes les catégories sur une période spécifiée.

## Utilisation

### Via cURL

```bash
curl -X POST http://localhost:3000/api/articles/generate-batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "startDate": "2024-11-02",
    "endDate": "2024-11-26",
    "force": false
  }'
```

### Paramètres

- `startDate` (optionnel) : Date de début au format `YYYY-MM-DD`. Par défaut : `2024-11-02`
- `endDate` (optionnel) : Date de fin au format `YYYY-MM-DD`. Par défaut : `2024-11-26`
- `force` (optionnel) : Si `true`, remplace les articles existants. Par défaut : `false`

### Authentification

Si la variable d'environnement `CRON_SECRET` est définie, vous devez inclure un header d'authentification :

```
Authorization: Bearer YOUR_CRON_SECRET
```

## Exemple : Générer les articles du 2 au 26 novembre 2024

Cette commande génère **300 articles** (25 jours × 12 catégories) :

```bash
curl -X POST http://localhost:3000/api/articles/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-11-02",
    "endDate": "2024-11-26"
  }'
```

## Résultat

La réponse JSON contient :

```json
{
  "message": "Batch generation completed: 300 created, 0 skipped, 0 errors",
  "period": {
    "start": "2024-11-02",
    "end": "2024-11-26"
  },
  "summary": {
    "totalCreated": 300,
    "totalSkipped": 0,
    "totalErrors": 0,
    "totalProcessed": 300
  },
  "results": [
    {
      "date": "2024-11-02",
      "category": "robes-mariee",
      "success": true,
      "article": { ... }
    },
    ...
  ]
}
```

## Caractéristiques

- **1 article par catégorie par jour** : Chaque catégorie reçoit un article unique pour chaque jour
- **Dates correctes** : Les articles sont créés avec la date spécifiée dans `created_at`
- **Contenu enrichi** : Les articles suivent le manifeste SEO GPT+ (1500-2500 mots, vocabulaire riche, FAQ)
- **Évite les doublons** : Par défaut, ne crée pas d'articles si un article existe déjà pour cette date et cette catégorie
- **Slugs uniques** : Les slugs sont rendus uniques automatiquement en cas de conflit

## Catégories incluses

1. robes-mariee
2. beaute
3. budget
4. ceremonie-reception
5. decoration
6. gastronomie
7. inspiration
8. papeterie-details
9. photo-video
10. prestataires
11. tendances
12. voyage-noces

## Notes importantes

- ⚠️ La génération de 300 articles peut prendre plusieurs minutes
- ⚠️ Assurez-vous d'avoir suffisamment d'espace dans votre base de données
- ⚠️ En production, utilisez l'authentification avec `CRON_SECRET`
- ✅ Les articles suivent les consignes de rédaction SEO GPT+ fournies

