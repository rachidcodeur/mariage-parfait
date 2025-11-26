# Configuration de la Génération Automatique d'Articles Quotidiens

Ce système génère automatiquement un article de blog pour chaque catégorie chaque jour.

## Fonctionnement

- **Route API** : `/api/articles/generate-daily`
- **Fréquence** : Une fois par jour à 2h00 du matin (UTC)
- **Catégories** : 12 catégories au total
- **Protection** : Vérifie si un article existe déjà aujourd'hui avant d'en créer un nouveau

## Configuration

### 1. Variables d'environnement

Assurez-vous d'avoir ces variables dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
CRON_SECRET=votre_secret_optional (optionnel, pour sécuriser l'endpoint)
```

### 2. Configuration Vercel Cron

Le fichier `vercel.json` est déjà configuré avec :

```json
{
  "crons": [
    {
      "path": "/api/articles/generate-daily",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Note** : Les cron jobs Vercel ne fonctionnent que sur les plans Pro et Enterprise. Pour les plans gratuits, vous devrez utiliser un service externe comme :
- GitHub Actions
- EasyCron
- Cron-job.org

### 3. Test manuel

Vous pouvez tester manuellement la génération :

```bash
# Sans authentification (si CRON_SECRET n'est pas défini)
curl -X POST http://localhost:3000/api/articles/generate-daily

# Avec authentification (si CRON_SECRET est défini)
curl -X POST http://localhost:3000/api/articles/generate-daily \
  -H "Authorization: Bearer votre_cron_secret"
```

### 4. Utilisation avec un service externe (pour plans gratuits)

Si vous utilisez un service externe pour les cron jobs, configurez-le pour appeler :

```
POST https://votre-domaine.com/api/articles/generate-daily
Authorization: Bearer votre_cron_secret (si défini)
```

## Fonctionnalités

### Vérification des doublons

Le système vérifie automatiquement si un article a déjà été créé aujourd'hui pour chaque catégorie. Si c'est le cas, il passe à la catégorie suivante sans créer de doublon.

### Génération unique

Chaque jour, les articles générés utilisent :
- Un titre sélectionné de manière cyclique basé sur le jour de l'année
- L'année en cours ajoutée au titre pour plus d'unicité
- Un slug unique (avec timestamp si nécessaire)

### Catégories traitées

1. Robes de Mariée
2. Beauté
3. Budget
4. Cérémonie & Réception
5. Décoration
6. Gastronomie
7. Inspiration
8. Papeterie & Détails
9. Photo & Vidéo
10. Prestataires
11. Tendances
12. Voyage de Noces

## Monitoring

Pour vérifier que les articles sont générés correctement :

1. Vérifiez les logs Vercel
2. Consultez la table `articles` dans Supabase
3. Testez manuellement l'endpoint

## Dépannage

### Les articles ne sont pas générés

1. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correctement configuré
2. Vérifiez les logs Vercel pour les erreurs
3. Testez manuellement l'endpoint
4. Vérifiez que le cron job est activé sur Vercel

### Erreurs RLS (Row Level Security)

Assurez-vous d'utiliser `SUPABASE_SERVICE_ROLE_KEY` et non `NEXT_PUBLIC_SUPABASE_ANON_KEY` pour contourner RLS.

### Articles dupliqués

Le système vérifie automatiquement les doublons. Si vous voyez des doublons, vérifiez :
- La colonne `created_at` dans la table `articles`
- Le fuseau horaire utilisé par Supabase

