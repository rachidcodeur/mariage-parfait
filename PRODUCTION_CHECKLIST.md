# ✅ Checklist Production - Mariage Parfait

## Routes Protégées ✅

Les routes suivantes sont maintenant **automatiquement désactivées en production** :

- ✅ `/api/contact/debug` - Route de debug du formulaire de contact
- ✅ `/api/contact/test` - Route de test du formulaire de contact  
- ✅ `/api/articles/generate` (GET) - Test de génération d'articles
- ✅ `/api/articles/generate-category` (GET) - Test de génération par catégorie
- ✅ `/api/articles/generate-daily` (GET) - Test de génération quotidienne

**Note** : Ces routes retournent une erreur 403 en production.

## Routes Admin Protégées ✅

Les routes suivantes sont protégées par authentification JWT :

- ✅ `/api/admin/approve-claim` - Nécessite un token JWT valide
- ✅ `/api/admin/reject-claim` - Nécessite un token JWT valide
- ✅ `/api/admin/get-user-info` - Nécessite SUPABASE_SERVICE_ROLE_KEY
- ✅ `/api/admin/reset-subscription` - Nécessite SUPABASE_SERVICE_ROLE_KEY
- ✅ `/api/admin/check-claim-status` - Nécessite SUPABASE_SERVICE_ROLE_KEY

## Messages d'Erreur ✅

Les messages d'erreur sont optimisés pour la production :
- ✅ Messages détaillés en développement
- ✅ Messages génériques en production (pas d'exposition d'informations sensibles)
- ✅ Stack traces uniquement en développement

## Variables d'Environnement Requises

### Obligatoires

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
```

### Optionnelles (selon fonctionnalités)

```env
# Stripe (si vous utilisez les paiements)
STRIPE_SECRET_KEY=sk_live_... (⚠️ LIVE en production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (⚠️ LIVE en production)
STRIPE_PRICE_ID=price_... (créé en mode LIVE)
STRIPE_BOOST_PRICE_ID=price_... (créé en mode LIVE)
STRIPE_WEBHOOK_SECRET=whsec_... (secret du webhook de production)

# Cron Jobs
CRON_SECRET=votre_secret_aleatoire_securise
```

## Configuration Stripe ⚠️

**IMPORTANT** : En production, vous DEVEZ utiliser les clés **LIVE** :

1. ✅ Créez vos produits et prix en mode **Live** dans Stripe
2. ✅ Utilisez `pk_live_...` et `sk_live_...` (pas `pk_test_...` ou `sk_test_...`)
3. ✅ Configurez le webhook de production avec l'URL : `https://votre-domaine.com/api/stripe/webhook`
4. ✅ Ajoutez le **Signing secret** du webhook à `STRIPE_WEBHOOK_SECRET`

## Configuration AdSense ⚠️

1. ✅ Vérifiez que votre site est **approuvé** par Google AdSense
2. ✅ Remplacez tous les Ad Slot IDs placeholder (`1234567890`) par vos vrais IDs dans :
   - `app/page.tsx`
   - `app/blog/page.tsx`
   - `app/blog/[slug]/page.tsx`
3. ✅ Vérifiez que `NEXT_PUBLIC_ADSENSE_CLIENT_ID` est configuré

## Configuration Vercel

### Cron Jobs

Le fichier `vercel.json` est configuré pour générer des articles automatiquement :
- **Chemin** : `/api/articles/generate-daily`
- **Horaire** : Tous les jours à 2h00 UTC
- **Protection** : Utilise `CRON_SECRET` si configuré

**Note** : Les cron jobs Vercel nécessitent un plan Pro ou Enterprise.

### Variables d'Environnement

1. Allez dans Vercel → Settings → Environment Variables
2. Ajoutez toutes les variables listées ci-dessus
3. Sélectionnez **Production** comme environnement
4. Redéployez après avoir ajouté les variables

## Tests Avant Déploiement

Avant de déployer, testez :

- [ ] Formulaire de contact fonctionne
- [ ] Newsletter fonctionne
- [ ] Inscription/Connexion fonctionne
- [ ] Paiements Stripe (avec cartes de test en mode Live)
- [ ] Génération d'articles (cron job)
- [ ] AdSense affiche les publicités
- [ ] Routes de debug retournent 403 en production

## Déploiement

```bash
# Build de test local
npm run build

# Si le build réussit, déployez
vercel --prod
```

## Post-Déploiement

Vérifiez :

- [ ] Le site charge correctement
- [ ] Les formulaires fonctionnent
- [ ] Les emails de confirmation sont envoyés
- [ ] Les paiements Stripe fonctionnent
- [ ] Les publicités AdSense s'affichent
- [ ] Les cron jobs s'exécutent correctement
- [ ] Les routes de debug sont bien désactivées

## Documentation Complète

Consultez `PRODUCTION_SETUP.md` pour un guide détaillé de configuration.

